import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export async function saveScoreToLeaderboard(userId, username, level, score) {
  try {
    const ref = doc(db, 'leaderboard', userId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const data = existing.data();
      if (score > (data.score || 0)) {
        await updateDoc(ref, {
          username,
          level,
          score,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await setDoc(ref, {
        userId,
        username,
        level,
        score,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.log('saveScoreToLeaderboard error:', e);
  }
}

export async function getGlobalLeaderboard(limitCount = 100) {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data(),
    }));
  } catch (e) {
    console.log('getGlobalLeaderboard error:', e);
    return [];
  }
}

export async function getWeeklyLeaderboard(limitCount = 100) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc, index) => ({ rank: index + 1, ...doc.data() }))
      .filter(p => p.updatedAt?.toDate() >= oneWeekAgo);
  } catch (e) {
    console.log('getWeeklyLeaderboard error:', e);
    return [];
  }
}

export async function saveUserProfile(userId, data) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.log('saveUserProfile error:', e);
  }
}

export async function getUserProfile(userId) {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.log('getUserProfile error:', e);
    return null;
  }
}

export async function saveCloudProgress(userId, progress) {
  try {
    await setDoc(doc(db, 'progress', userId), {
      progress,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.log('saveCloudProgress error:', e);
  }
}

export async function getCloudProgress(userId) {
  try {
    const ref = doc(db, 'progress', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().progress : null;
  } catch (e) {
    console.log('getCloudProgress error:', e);
    return null;
  }
}