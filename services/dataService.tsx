import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, getDoc, query, where, documentId } from 'firebase/firestore';
import { Product, User } from '../types';
import { PRODUCTS as initialProducts } from '../constants';

if (!db) {
  throw new Error("A configuração do Firebase não foi carregada. Verifique o arquivo firebase/config.ts");
}

// ================== Restauração de Dados ==================
export async function restoreInitialData(): Promise<void> {
  console.log("Iniciando restauração de dados para o Firebase...");
  
  const batch = writeBatch(db);

  // 1. Deletar todos os produtos existentes
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  productSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  console.log(`${productSnapshot.size} produtos existentes marcados para exclusão.`);

  // 2. Deletar o documento de configuração (marcas/categorias)
  const configDocRef = doc(db, 'config', 'app_config');
  batch.delete(configDocRef);
  console.log("Documento de configuração existente marcado para exclusão.");
  
  // 3. Adicionar produtos iniciais a partir do constants.ts
  initialProducts.forEach(product => {
    const docRef = doc(db, 'products', product.id);
    batch.set(docRef, product);
  });
  console.log(`${initialProducts.length} produtos iniciais marcados para adição.`);
  
  // 4. Criar novo documento de configuração com marcas e categorias
  const initialMarcas = [...new Set(initialProducts.map(p => p.marca))].sort();
  const initialCategories = [...new Set(initialProducts.map(p => p.category))].sort();
  batch.set(configDocRef, {
    marcas: initialMarcas,
    categories: initialCategories,
  });
  console.log("Novo documento de configuração marcado para adição.");

  // 5. Commit todas as operações no batch
  await batch.commit();
  console.log("Restauração de dados para o Firebase concluída com sucesso!");
};

// ================== Verificação de Saúde do Firebase ==================
export async function checkFirestoreConnection(): Promise<void> {
    const docRef = doc(db, 'health_checks', 'test_write');
    await setDoc(docRef, { timestamp: new Date(), status: 'testing' });
    await deleteDoc(docRef);
}

// ================== Produtos ==================
export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return products.sort((a, b) => a.name.localeCompare(b.name));
};

export async function saveProduct(
    productData: Omit<Product, 'id'> & { id?: string }
): Promise<Product> {
    // Cria um objeto limpo e sanitizado para o Firestore para prevenir valores undefined.
    const dataForFirestore = {
        name: productData.name,
        marca: productData.marca,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.imageUrl, // A URL é salva diretamente
        isOutOfStock: productData.isOutOfStock || false,
        isFeatured: productData.isFeatured || false,
        variants: (productData.variants || []).map(v => ({
            id: v.id,
            name: v.name,
            isOutOfStock: v.isOutOfStock === true, // Garante explicitamente que seja um booleano
        })),
        discounts: (productData.discounts || []).map(d => ({
            quantity: d.quantity,
            value: d.value,
            type: d.type,
        })), // Mapeia explicitamente os campos para remover o 'id' temporário
    };
    
    const docRef = productData.id ? doc(db, 'products', productData.id) : doc(collection(db, 'products'));
    await setDoc(docRef, dataForFirestore);
    
    // Constrói o objeto para retornar ao estado do aplicativo, garantindo que esteja completo.
    const savedProduct: Product = {
        ...dataForFirestore,
        id: docRef.id,
    };

    return savedProduct;
};

export async function deleteProduct(product: Product): Promise<void> {
    // A imagem não é mais gerenciada pelo app, então basta deletar o documento.
    await deleteDoc(doc(db, 'products', product.id));
};

// ================== Marcas & Categorias ==================
async function getConfigDoc(): Promise<{ marcas: string[], categories: string[] }> {
  const configDocRef = doc(db, 'config', 'app_config');
  const docSnap = await getDoc(configDocRef);
  if (!docSnap.exists()) {
    console.warn("Documento de configuração não encontrado! Execute a restauração de dados.");
    return { marcas: [], categories: [] };
  }
  const data = docSnap.data();
  // Garante que sempre retornaremos um array, mesmo que o campo não exista no documento.
  return {
    marcas: Array.isArray(data.marcas) ? data.marcas : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
  };
}

export async function getMarcas(): Promise<string[]> {
  const config = await getConfigDoc();
  return config.marcas;
};

export async function getCategories(): Promise<string[]> {
  const config = await getConfigDoc();
  return config.categories;
};

async function addItem(itemType: 'marcas' | 'categories', itemName: string): Promise<void> {
  const configDocRef = doc(db, 'config', 'app_config');
  const config = await getConfigDoc();
  const items = config[itemType];
  const trimmedItemName = itemName.trim();
  
  // Verificação case-insensitive para corresponder à lógica da UI e evitar duplicatas
  if (trimmedItemName && !items.some(i => i.toLowerCase() === trimmedItemName.toLowerCase())) {
    const newItems = [...items, trimmedItemName].sort();
    await setDoc(configDocRef, { [itemType]: newItems }, { merge: true });
  }
}
export function addMarca(name: string): Promise<void> { return addItem('marcas', name) };
export function addCategory(name: string): Promise<void> { return addItem('categories', name) };

async function deleteItem(itemType: 'marcas' | 'categories', itemName: string): Promise<void> {
    const config = await getConfigDoc();
    const items = config[itemType];
    const newItems = items.filter(i => i !== itemName);
    await setDoc(doc(db, 'config', 'app_config'), { [itemType]: newItems }, { merge: true });
};
export function deleteMarca(name: string): Promise<void> { return deleteItem('marcas', name) };
export function deleteCategory(name: string): Promise<void> { return deleteItem('categories', name) };

async function updateItem(itemType: 'marca' | 'category', oldName: string, newName: string): Promise<void> {
    // 1. Update config document
    const configDocRef = doc(db, 'config', 'app_config');
    const config = await getConfigDoc();
    const items = config[itemType === 'marca' ? 'marcas' : 'categories'];
    const updatedItems = items.map(i => i === oldName ? newName : i).sort();
    
    // 2. Find all products using the old item name
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where(itemType, "==", oldName));
    const querySnapshot = await getDocs(q);

    // 3. Use a batch to update everything atomically
    const batch = writeBatch(db);
    batch.set(configDocRef, { [itemType === 'marca' ? 'marcas' : 'categories']: updatedItems }, { merge: true });

    querySnapshot.forEach(documentSnapshot => {
        batch.update(documentSnapshot.ref, { [itemType]: newName });
    });

    await batch.commit();
};
export function updateMarca(oldName: string, newName: string): Promise<void> { return updateItem('marca', oldName, newName) };
export function updateCategory(oldName: string, newName: string): Promise<void> { return updateItem('category', oldName, newName) };


// ================== Usuários ==================
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(doc => doc.data() as User);
};

export async function addUser(user: User): Promise<void> {
    // Use WhatsApp as the document ID for easy lookup and to prevent duplicates
    const userRef = doc(db, 'users', user.whatsapp);
    await setDoc(userRef, user);
};

export async function updateUser(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.whatsapp);
    await setDoc(userRef, user, { merge: true });
};

export async function deleteUser(whatsapp: string): Promise<void> {
    await deleteDoc(doc(db, 'users', whatsapp));
};