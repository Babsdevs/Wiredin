import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { playBackgroundMusic } from '../utils/soundManager';
import { colors } from '../utils/theme';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenView({ navigation }) {
  const glowAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      playBackgroundMusic('home');

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        navigation.replace('Home');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[
        styles.logoContainer,
        { transform: [{ scale: scaleAnim }], opacity: glowAnim }
      ]}>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>QUIZ</Text>
          </View>
        </View>

        <Text style={styles.logoTop}>WIRED</Text>
        <View style={styles.logoBottomRow}>
          <View style={styles.goldLine} />
          <Text style={styles.logoBottom}>IN</Text>
          <View style={styles.goldLine} />
        </View>

        <Text style={styles.tagline}>Know Everything. Miss Nothing.</Text>

      </Animated.View>

      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2D1B69',
    top: -80,
    right: -80,
    opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2D1B69',
    bottom: -60,
    left: -60,
    opacity: 0.4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    marginBottom: 16,
  },
  badge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 12,
    color: colors.background,
    letterSpacing: 4,
  },
  logoTop: {
    fontFamily: 'Nunito_900Black',
    fontSize: 72,
    color: colors.white,
    letterSpacing: 12,
    lineHeight: 76,
  },
  logoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  goldLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  logoBottom: {
    fontFamily: 'Nunito_900Black',
    fontSize: 72,
    color: colors.gold,
    letterSpacing: 12,
    lineHeight: 76,
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 20,
    letterSpacing: 1.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: colors.gold,
    width: 24,
  },
});