import { initializeApp } from 'firebase/app';
// @ts-expect-error - O método getReactNativePersistence existe no bundle nativo de React Native do Firebase, mas não é exposto nas tipagens Web padrão.
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Exportando o serviço de autenticação com persistência nativa estável
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});