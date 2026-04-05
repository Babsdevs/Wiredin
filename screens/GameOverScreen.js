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

export default function GameOverScreen({ navigation, route }) {
  const { level, score, passMark } = route.params || {
    level: 1, score: 0, passMark: 15
  };

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pointsShort = passMark - score;

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    playSound('gameover');
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.card, {
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }]}>

        <Text style={styles.emoji}>😬</Text>
        <Text style={styles.title}>So Close!</Text>
        <Text style={styles.sub}>
          You needed just {pointsShort > 0 ? pointsShort : 0} more {pointsShort === 1 ? 'point' : 'points'}
        </Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>Your Score</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: colors.gold }]}>{passMark}</Text>
            <Text style={styles.scoreLabel}>Pass Mark</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${Math.min(100, (score / passMark) * 100)}%`
            }]} />
          </View>
          <Text style={styles.progressLabel}>
            {Math.round((score / passMark) * 100)}% of pass mark
          </Text>
        </View>

      </Animated.View>

      <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>

        <TouchableOpacity style={styles.watchAdBtn}>
          <Text style={styles.watchAdIcon}>▶</Text>
          <View>
            <Text style={styles.watchAdTitle}>Watch Ad to Try Again</Text>
            <Text style={styles.watchAdSub}>Free retry — takes 30 seconds</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.replace('Countdown', {
            level,
            categories: route.params?.categories || ['Maths'],
          })}
        >
          <Text style={styles.retryBtnText}>Try Again</Text>
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
    borderColor: colors.wrong,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Nunito_900Black',
    fontSize: 32,
    color: colors.white,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 36,
    color: colors.wrong,
  },
  scoreLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    backgroundColor: '#3D2B79',
    marginHorizontal: 8,
  },
  progressContainer: {
    width: '100%',
    gap: 8,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.wrong,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  watchAdBtn: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  watchAdIcon: {
    fontSize: 20,
    color: colors.background,
  },
  watchAdTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.background,
  },
  watchAdSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.background,
    opacity: 0.7,
    marginTop: 2,
  },
  retryBtn: {
    backgroundColor: '#2D1B69',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.wrong,
  },
  retryBtnText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.wrong,
    letterSpacing: 1,
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