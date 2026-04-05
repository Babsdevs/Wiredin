import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';
import { fadeOutMusic } from '../utils/soundManager';

const { width, height } = Dimensions.get('window');

const FloatingParticle = ({ delay, x, size }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 3000 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.gold,
        opacity: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.6, 0],
        }),
        transform: [{
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [height, -50],
          }),
        }],
      }}
    />
  );
};

export default function HomeScreen({ navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!fontsLoaded) return null;

  const particles = [
    { x: 30, size: 4, delay: 0 },
    { x: 80, size: 3, delay: 500 },
    { x: 140, size: 5, delay: 1000 },
    { x: 200, size: 3, delay: 1500 },
    { x: 260, size: 4, delay: 800 },
    { x: 310, size: 3, delay: 300 },
    { x: 360, size: 5, delay: 1200 },
  ];

  return (
    <View style={styles.container}>

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {particles.map((p, i) => (
        <FloatingParticle key={i} x={p.x} size={p.size} delay={p.delay} />
      ))}

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>

        <View style={styles.topBar}>
          <View style={styles.coinContainer}>
            <View style={styles.coinCircle}>
              <Text style={styles.coinIcon}>✦</Text>
            </View>
            <Text style={styles.coinText}>0</Text>
          </View>
         <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>
        </View>

        <View style={styles.logoSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>QUIZ</Text>
          </View>
          <Text style={styles.logoTop}>WIRED</Text>
          <View style={styles.logoBottomRow}>
            <View style={styles.goldLine} />
            <Text style={styles.logoBottom}>IN</Text>
            <View style={styles.goldLine} />
          </View>
          <Text style={styles.tagline}>Know Everything. Miss Nothing.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
            fadeOutMusic(600);
            navigation.navigate('LevelMap');
          }}
            activeOpacity={0.85}
          >
            <View style={styles.playButtonInner}>
              <Text style={styles.playButtonText}>PLAY</Text>
              <Text style={styles.playArrow}>▶</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.bottomBtnIcon}>🏆</Text>
            <Text style={styles.bottomBtnText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn}>
            <Text style={styles.bottomBtnIcon}>👤</Text>
            <Text style={styles.bottomBtnText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn}>
            <Text style={styles.bottomBtnIcon}>🎁</Text>
            <Text style={styles.bottomBtnText}>Daily Reward</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#2D1B69',
    top: -120,
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
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#3D2B79',
    top: height * 0.4,
    right: -40,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: 6,
  },
  coinCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIcon: {
    fontSize: 10,
    color: colors.background,
  },
  coinText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.gold,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  settingsIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 11,
    color: colors.background,
    letterSpacing: 4,
  },
  logoTop: {
    fontFamily: 'Nunito_900Black',
    fontSize: 56,
    color: colors.white,
    letterSpacing: 10,
    lineHeight: 60,
  },
  logoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  goldLine: {
    width: 36,
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  logoBottom: {
    fontFamily: 'Nunito_900Black',
    fontSize: 56,
    color: colors.gold,
    letterSpacing: 10,
    lineHeight: 60,
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    color: colors.gold,
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
    marginHorizontal: 8,
  },
  playButton: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    marginBottom: 32,
    overflow: 'hidden',
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  playButtonText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    color: colors.background,
    letterSpacing: 4,
  },
  playArrow: {
    fontSize: 18,
    color: colors.background,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomBtn: {
    alignItems: 'center',
    gap: 4,
  },
  bottomBtnIcon: {
    fontSize: 24,
  },
  bottomBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
  },
});