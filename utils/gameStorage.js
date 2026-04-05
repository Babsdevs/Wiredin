import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROGRESS: 'wiredin_progress',
  COINS: 'wiredin_coins',
  HIGH_SCORES: 'wiredin_highscores',
  TOTAL_COINS_EARNED: 'wiredin_total_coins',
  OWNED_ITEMS: 'wiredin_owned_items',
  EQUIPPED_ITEMS: 'wiredin_equipped_items',
  DAILY_STREAK: 'wiredin_daily_streak',
  LAST_PLAYED: 'wiredin_last_played',
};

export const VAULT_TIERS = [
  { name: 'Rookie', min: 0, color: '#888', icon: '📦' },
  { name: 'Bronze Brain', min: 1000, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver Mind', min: 5000, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold Genius', min: 15000, color: '#FFD700', icon: '🥇' },
  { name: 'Diamond Scholar', min: 40000, color: '#00E5CC', icon: '💎' },
  { name: 'Wired In Legend', min: 100000, color: '#FF6B9D', icon: '👑' },
];

export const LEVEL_COIN_GATES = {
  6: 500,
  8: 1500,
  10: 3000,
  12: 6000,
  15: 12000,
  18: 25000,
  20: 50000,
};

export const COIN_REWARDS = {
  CORRECT_FAST: 20,
  CORRECT_MID: 12,
  CORRECT_SLOW: 5,
  LEVEL_PASS_FIRST: 100,
  LEVEL_PASS_SECOND: 50,
  THREE_STARS: 75,
  STREAK_5: 50,
  STREAK_10: 150,
  PERFECT_ROUND: 300,
  DAILY_LOGIN: 50,
  DAILY_STREAK_7: 500,
  TIME_ATTACK_CORRECT: 35,
  TIME_ATTACK_COMPLETE: 200,
  TIME_ATTACK_PERFECT: 500,
  TIME_ATTACK_SPEED: 300,
};

export function getVaultTier(totalCoins) {
  let current = VAULT_TIERS[0];
  for (const tier of VAULT_TIERS) {
    if (totalCoins >= tier.min) current = tier;
  }
  return current;
}

export function getNextVaultTier(totalCoins) {
  for (const tier of VAULT_TIERS) {
    if (totalCoins < tier.min) return tier;
  }
  return null;
}

export function canUnlockLevel(levelNumber, totalCoins) {
  const required = LEVEL_COIN_GATES[levelNumber];
  if (!required) return true;
  return totalCoins >= required;
}

export function getLevelCoinRequirement(levelNumber) {
  return LEVEL_COIN_GATES[levelNumber] || 0;
}

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

export async function getTotalCoinsEarned() {
  try {
    const data = await AsyncStorage.getItem(KEYS.TOTAL_COINS_EARNED);
    return data ? parseInt(data) : 0;
  } catch (e) {
    return 0;
  }
}

export async function addCoins(amount) {
  try {
    const current = await getCoins();
    const totalEarned = await getTotalCoinsEarned();
    const newTotal = current + amount;
    const newTotalEarned = totalEarned + amount;
    await AsyncStorage.setItem(KEYS.COINS, newTotal.toString());
    await AsyncStorage.setItem(KEYS.TOTAL_COINS_EARNED, newTotalEarned.toString());
    return newTotal;
  } catch (e) {
    console.error('addCoins error:', e);
    return 0;
  }
}

export async function spendCoins(amount) {
  try {
    const current = await getCoins();
    if (current < amount) return { success: false, balance: current };
    const newTotal = current - amount;
    await AsyncStorage.setItem(KEYS.COINS, newTotal.toString());
    return { success: true, balance: newTotal };
  } catch (e) {
    return { success: false, balance: 0 };
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

export async function getOwnedItems() {
  try {
    const data = await AsyncStorage.getItem(KEYS.OWNED_ITEMS);
    return data ? JSON.parse(data) : ['frame_default'];
  } catch (e) {
    return ['frame_default'];
  }
}

export async function purchaseItem(itemId) {
  try {
    const owned = await getOwnedItems();
    if (owned.includes(itemId)) return { success: false, error: 'Already owned' };
    owned.push(itemId);
    await AsyncStorage.setItem(KEYS.OWNED_ITEMS, JSON.stringify(owned));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getEquippedItems() {
  try {
    const data = await AsyncStorage.getItem(KEYS.EQUIPPED_ITEMS);
    return data ? JSON.parse(data) : { frame: 'frame_default', scorePop: 'pop_default' };
  } catch (e) {
    return { frame: 'frame_default', scorePop: 'pop_default' };
  }
}

export async function equipItem(slot, itemId) {
  try {
    const equipped = await getEquippedItems();
    equipped[slot] = itemId;
    await AsyncStorage.setItem(KEYS.EQUIPPED_ITEMS, JSON.stringify(equipped));
    return equipped;
  } catch (e) {
    return null;
  }
}

export async function checkAndUpdateDailyStreak() {
  try {
    const lastPlayed = await AsyncStorage.getItem(KEYS.LAST_PLAYED);
    const streak = await AsyncStorage.getItem(KEYS.DAILY_STREAK);
    const today = new Date().toDateString();
    const currentStreak = streak ? parseInt(streak) : 0;

    if (lastPlayed === today) {
      return { bonus: 0, streak: currentStreak, alreadyCollected: true };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastPlayed === yesterday.toDateString();
    const newStreak = isConsecutive ? currentStreak + 1 : 1;

    await AsyncStorage.setItem(KEYS.LAST_PLAYED, today);
    await AsyncStorage.setItem(KEYS.DAILY_STREAK, newStreak.toString());

    const bonus = newStreak >= 7
      ? COIN_REWARDS.DAILY_STREAK_7
      : COIN_REWARDS.DAILY_LOGIN;

    await addCoins(bonus);
    return { bonus, streak: newStreak, alreadyCollected: false };
  } catch (e) {
    return { bonus: 0, streak: 0, alreadyCollected: true };
  }
}