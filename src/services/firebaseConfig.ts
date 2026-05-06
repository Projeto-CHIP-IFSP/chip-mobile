// Importando as funções do firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configurações do nosso projeto puxando do env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicializando o firebase
const app = initializeApp(firebaseConfig);

// Exportando o serviço de autenticação
export const auth = getAuth(app);