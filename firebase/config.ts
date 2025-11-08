// Importe as funções que você precisa dos SDKs que você precisa
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// **************************************************************************************************
// TODO: ADICIONE A CONFIGURAÇÃO DO SEU PROJETO FIREBASE AQUI
//
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou selecione um existente.
// 3. Vá para as Configurações do Projeto (ícone de engrenagem).
// 4. Na aba "Geral", role para baixo até "Seus aplicativos".
// 5. Clique no ícone da Web (</>) para criar um novo aplicativo da Web ou selecione um existente.
// 6. Copie o objeto de configuração do Firebase (firebaseConfig) e cole-o abaixo.
// **************************************************************************************************

// Configuração do Firebase do usuário aplicada.
export const firebaseConfig = {
  apiKey: "AIzaSyAJFXhTVYpXVIFqRGD4AYZ_KhQl89lwwwo",
  authDomain: "catalago-ki-charme.firebaseapp.com",
  projectId: "catalago-ki-charme",
  storageBucket: "catalago-ki-charme.appspot.com",
  messagingSenderId: "515757258246",
  appId: "1:515757258246:web:e2d7ea612cd8b70fcbf587"
};

// Verifica se a configuração foi preenchida
export const isFirebaseConfigured = !!firebaseConfig.projectId;

// Verifique se o Firebase já foi inicializado
let app;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Falha ao inicializar o Firebase. Verifique sua configuração.", e);
  }
} else {
    console.warn("Configuração do Firebase não fornecida. O aplicativo será executado em modo de demonstração.");
}


export { db, storage };