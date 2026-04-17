import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCK8Rzh8PK62xorCmcn0r5TRD2y61e6Y84",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "wiredin-5050b.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "wiredin-5050b",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "wiredin-5050b.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "565471983533",
  appId: process.env.FIREBASE_APP_ID || "1:565471983533:web:7cfc2fe542951f508f9324",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;