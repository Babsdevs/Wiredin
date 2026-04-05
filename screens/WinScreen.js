import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';
import { playSound } from '../utils/soundManager';

export default function WinScreen({ navigation, route }) {
  const { level, score, correct, total } = route.params || {
    level: 1, score: 0, correct: 0, total: 10
  };

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const percentage = total > 0 ? (correct / total) : 0;
  const stars = percentage >= 0.9 ? 3 : percentage >= 0.6 ? 2 : 1;
  const coinsEarned = score;

  useEffect(() => {
     playSound('levelwin');
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(star1, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.spring(star2, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.spring(star3, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!fontsLoaded) return null;

  const starAnims = [star1, star2, star3];

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>

        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.winTitle}>Level {level} Complete!</Text>
        <Text style={styles.winSub}>Well done, you crushed it!</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3].map((s, i) => (
            <Animated.Text
              key={s}
              style={[
                styles.star,
                s <= stars ? styles.starFilled : styles.starEmpty,
                { transform: [{ scale: starAnims[i] }] }
              ]}
            >
              ★
            </Animated.Text>
          ))}
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>Points Scored</Text>
        </View>

        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{total - correct}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.gold }]}>
              +{coinsEarned}
            </Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </Animated.View>

      </Animated.View>

      <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => navigation.navigate('Category', { level: level + 1 })}
        >
          <Text style={styles.nextBtnText}>NEXT LEVEL ▶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bgCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#2D1B69',
    top: -100,
    right: -100,
    opacity: 0.5,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#2D1B69',
    bottom: -80,
    left: -80,
    opacity: 0.4,
  },
  card: {
    backgroundColor: '#2D1B69',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  trophy: {
    fontSize: 60,
    marginBottom: 12,
  },
  winTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    color: colors.gold,
    textAlign: 'center',
  },
  winSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  star: {
    fontSize: 44,
  },
  starFilled: {
    color: colors.gold,
  },
  starEmpty: {
    color: '#3D2B79',
  },
  scoreBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  scoreNumber: {
    fontFamily: 'Nunito_900Black',
    fontSize: 52,
    color: colors.gold,
    lineHeight: 56,
  },
  scoreLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    color: colors.white,
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#3D2B79',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  nextBtn: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextBtnText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: colors.background,
    letterSpacing: 2,
  },
  homeBtn: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  homeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
});