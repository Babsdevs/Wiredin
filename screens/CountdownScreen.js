import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, Nunito_900Black } from '@expo-google-fonts/nunito';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { colors, categoryColors } from '../utils/theme';

export default function CountdownScreen({ navigation, route }) {
  const { level, categories } = route.params || { level: 1, categories: ['Maths'] };
  const [count, setCount] = useState(3);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Poppins_400Regular,
  });

  const animateCount = () => {
    scaleAnim.setValue(1.5);
    opacityAnim.setValue(1);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!fontsLoaded) return;

    animateCount();
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setTimeout(() => {
            navigation.replace('Quiz', { level, categories });
          }, 800);
          return 'GO!';
        }
        animateCount();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const isGo = count === 'GO!';

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.topSection}>
        <Text style={styles.levelLabel}>LEVEL {level}</Text>
        <Text style={styles.getReady}>Get Ready...</Text>
      </View>

      <View style={styles.categoryRow}>
        {(categories || []).slice(0, 5).map((cat, i) => (
          <View
            key={i}
            style={[styles.catPill, {
              backgroundColor: (categoryColors[cat] || colors.gold) + '22',
              borderColor: categoryColors[cat] || colors.gold,
            }]}
          >
            <Text style={[styles.catPillText, {
              color: categoryColors[cat] || colors.gold
            }]}>
              {cat}
            </Text>
          </View>
        ))}
      </View>

      <Animated.Text style={[
        styles.countText,
        isGo && styles.goText,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
      ]}>
        {count}
      </Animated.Text>

      <Text style={styles.bottomHint}>
        {isGo ? 'Here we go!' : `${count} second${count !== 1 ? 's' : ''}...`}
      </Text>
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
  topSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  levelLabel: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
    color: colors.gold,
    letterSpacing: 4,
    marginBottom: 8,
  },
  getReady: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    color: colors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    marginBottom: 48,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  catPillText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },
  countText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 140,
    color: colors.white,
    lineHeight: 150,
  },
  goText: {
    color: colors.gold,
    fontSize: 80,
  },
  bottomHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 32,
  },
});