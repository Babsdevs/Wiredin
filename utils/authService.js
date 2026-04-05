import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';
import { saveUserProfile } from './firestoreService';

export async function registerWithEmail(email, password, username) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });
    await saveUserProfile(result.user.uid, {
      username,
      email,
      createdAt: new Date().toISOString(),
    });
    return { user: result.user, error: null };
  } catch (e) {
    return { user: null, error: e.message };
  }
}

export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (e) {
    return { user: null, error: e.message };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}