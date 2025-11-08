import { db, storage } from '../firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, getDoc, query, where, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Product, User } from '../types';
import { PRODUCTS as initialProducts } from '../constants';

if (!db || !storage) {
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
  const initialBrands = [...new Set(initialProducts.map(p => p.brand))].sort();
  const initialCategories = [...new Set(initialProducts.map(p => p.category))].sort();
  batch.set(configDocRef, {
    brands: initialBrands,
    categories: initialCategories,
  });
  console.log("Novo documento de configuração marcado para adição.");

  // 5. Commit todas as operações no batch
  await batch.commit();
  console.log("Restauração de dados para o Firebase concluída com sucesso!");
};

// ================== Produtos ==================
export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return products.sort((a, b) => a.name.localeCompare(b.name));
};

export async function saveProduct(
    productData: Omit<Product, 'id'> & { id?: string }, 
    imageFile: File | null
): Promise<Product> {
    let finalImageUrl = productData.imageUrl;

    if (imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
    }
    
    const docRef = productData.id ? doc(db, 'products', productData.id) : doc(collection(db, 'products'));
    
    const productToSave: Product = {
        ...productData,
        id: docRef.id,
        imageUrl: finalImageUrl,
    };
    
    await setDoc(docRef, productToSave);
    return productToSave;
};

export async function deleteProduct(product: Product): Promise<void> {
    // Delete image from storage if it's a firebase URL
    if (product.imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
            const imageRef = ref(storage, product.imageUrl);
            await deleteObject(imageRef);
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.warn("Imagem não encontrada no Storage, pode já ter sido removida:", product.imageUrl);
            } else {
                console.error("Erro ao deletar imagem do Storage:", error);
            }
        }
    }
    
    await deleteDoc(doc(db, 'products', product.id));
};

// ================== Marcas & Categorias ==================
async function getConfigDoc() {
  const configDocRef = doc(db, 'config', 'app_config');
  const docSnap = await getDoc(configDocRef);
  if (!docSnap.exists()) {
    console.warn("Documento de configuração não encontrado! Execute a restauração de dados.");
    return { brands: [], categories: [] };
  }
  return docSnap.data() as { brands: string[], categories: string[] };
}

export async function getBrands(): Promise<string[]> {
  const config = await getConfigDoc();
  return config.brands;
};

export async function getCategories(): Promise<string[]> {
  const config = await getConfigDoc();
  return config.categories;
};

async function addItem(itemType: 'brands' | 'categories', itemName: string): Promise<void> {
  const config = await getConfigDoc();
  const items = config[itemType];
  if (!items.includes(itemName)) {
    const newItems = [...items, itemName].sort();
    await setDoc(doc(db, 'config', 'app_config'), { [itemType]: newItems }, { merge: true });
  }
}
export function addBrand(name: string): Promise<void> { return addItem('brands', name) };
export function addCategory(name: string): Promise<void> { return addItem('categories', name) };

async function deleteItem(itemType: 'brands' | 'categories', itemName: string): Promise<void> {
    const config = await getConfigDoc();
    const items = config[itemType];
    const newItems = items.filter(i => i !== itemName);
    await setDoc(doc(db, 'config', 'app_config'), { [itemType]: newItems }, { merge: true });
};
export function deleteBrand(name: string): Promise<void> { return deleteItem('brands', name) };
export function deleteCategory(name: string): Promise<void> { return deleteItem('categories', name) };

async function updateItem(itemType: 'brand' | 'category', oldName: string, newName: string): Promise<void> {
    // 1. Update config document
    const configDocRef = doc(db, 'config', 'app_config');
    const config = await getConfigDoc();
    const items = config[itemType === 'brand' ? 'brands' : 'categories'];
    const updatedItems = items.map(i => i === oldName ? newName : i).sort();
    
    // 2. Find all products using the old item name
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where(itemType, "==", oldName));
    const querySnapshot = await getDocs(q);

    // 3. Use a batch to update everything atomically
    const batch = writeBatch(db);
    batch.set(configDocRef, { [itemType === 'brand' ? 'brands' : 'categories']: updatedItems }, { merge: true });

    querySnapshot.forEach(documentSnapshot => {
        batch.update(documentSnapshot.ref, { [itemType]: newName });
    });

    await batch.commit();
};
export function updateBrand(oldName: string, newName: string): Promise<void> { return updateItem('brand', oldName, newName) };
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