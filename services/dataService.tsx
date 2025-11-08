import { Product, User } from '../types';
import { PRODUCTS as initialProducts } from '../constants';

const PRODUCTS_KEY = 'products';
const USERS_KEY = 'users';

// =================================================================================
// NOTA PARA O DESENVOLVEDOR:
// Este arquivo foi preparado para se conectar a um backend e sincronizar os dados.
// As funções agora são 'assíncronas' (async), o que é necessário para
// se comunicar com um servidor na nuvem.
//
// PARA COMPLETAR A SINCRONIZAÇÃO:
// Um desenvolvedor precisa substituir a lógica de `localStorage` dentro destas
// funções por chamadas a um backend real (ex: Firebase).
//
//    - Firebase Firestore: Para buscar e salvar os dados de produtos e usuários.
//      (Ex: `db.collection('products').get()`, `db.collection('products').add(...)`)
//
//    - Firebase Storage: Para fazer upload das imagens dos produtos.
//      (Ex: `storage.ref(`images/${file.name}`).put(file)`)
//
// Após a integração, qualquer alteração feita em um dispositivo será
// refletida automaticamente em todos os outros.
// =================================================================================

// Simulação de uma chamada de API (mantendo o localStorage como fallback por enquanto)
const simulateApiCall = <T,>(key: string, fallbackData: T): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const savedData = localStorage.getItem(key);
                resolve(savedData ? JSON.parse(savedData) : fallbackData);
            } catch (error) {
                console.error(`Falha ao carregar dados da chave '${key}':`, error);
                resolve(fallbackData);
            }
        }, 200); // Pequeno delay para simular a rede
    });
};


export const getProducts = async (): Promise<Product[]> => {
  console.log("Buscando produtos...");
  // SUBSTITUIR: Lógica para buscar produtos do seu backend (ex: Firebase Firestore)
  // Exemplo com Firebase:
  // const snapshot = await db.collection('products').get();
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Fallback temporário usando localStorage
  return await simulateApiCall<Product[]>(PRODUCTS_KEY, initialProducts);
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  console.log("Salvando produtos...");
  // SUBSTITUIR: Lógica para salvar a lista completa de produtos no seu backend.
  // Nota: Um backend mais robusto teria endpoints para adicionar/editar/excluir
  // um produto de cada vez, em vez de salvar a lista inteira.
  
  // Fallback temporário usando localStorage
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Falha ao salvar produtos no localStorage:", error);
  }
};

export const getUsers = async (): Promise<User[]> => {
    console.log("Buscando usuários...");
  // SUBSTITUIR: Lógica para buscar usuários do seu backend.
  
  // Fallback temporário usando localStorage
  return await simulateApiCall<User[]>(USERS_KEY, []);
};

export const saveUsers = async (users: User[]): Promise<void> => {
  console.log("Salvando usuários...");
  // SUBSTITUIR: Lógica para salvar usuários no seu backend.

  // Fallback temporário usando localStorage
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Falha ao salvar usuários no localStorage:", error);
  }
};
