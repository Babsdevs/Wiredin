import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROGRESS: 'wiredin_progress',
  COINS: 'wiredin_coins',
  HIGH_SCORES: 'wiredin_highscores',
};

export async function saveProgress(levelNumber, stars, score) {
  try {
    const existing = await getProgress();
    const updated = {
      ...existing,
      [levelNumber]: {
        completed: true,
        stars: Math.max(stars, existing[levelNumber]?.stars || 0),
        score: Math.max(score, existing[levelNumber]?.score || 0),
      },
    };
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('saveProgress error:', e);
  }
}

export async function getProgress() {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export async function getCoins() {
  try {
    const data = await AsyncStorage.getItem(KEYS.COINS);
    return data ? parseInt(data) : 0;
  } catch (e) {
    return 0;
  }
}

export async function addCoins(amount) {
  try {
    const current = await getCoins();
    const newTotal = current + amount;
    await AsyncStorage.setItem(KEYS.COINS, newTotal.toString());
    return newTotal;
  } catch (e) {
    console.error('addCoins error:', e);
  }
}

export async function getHighScore(levelNumber) {
  try {
    const data = await AsyncStorage.getItem(KEYS.HIGH_SCORES);
    const scores = data ? JSON.parse(data) : {};
    return scores[levelNumber] || 0;
  } catch (e) {
    return 0;
  }
}

export async function saveHighScore(levelNumber, score) {
  try {
    const data = await AsyncStorage.getItem(KEYS.HIGH_SCORES);
    const scores = data ? JSON.parse(data) : {};
    if (score > (scores[levelNumber] || 0)) {
      scores[levelNumber] = score;
      await AsyncStorage.setItem(KEYS.HIGH_SCORES, JSON.stringify(scores));
    }
  } catch (e) {
    console.error('saveHighScore error:', e);
  }
}