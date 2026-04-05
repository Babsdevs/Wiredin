import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCK8Rzh8PK62xorCmcn0r5TRD2y61e6Y84",
  authDomain: "wiredin-5050b.firebaseapp.com",
  projectId: "wiredin-5050b",
  storageBucket: "wiredin-5050b.firebasestorage.app",
  messagingSenderId: "565471983533",
  appId: "1:565471983533:web:7cfc2fe542951f508f9324"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;