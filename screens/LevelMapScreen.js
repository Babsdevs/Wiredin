import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';

const { width } = Dimensions.get('window');

const LEVELS = Array.from({ length: 20 }, (_, i) => ({
  number: i + 1,
  passMark: [0,15,20,25,30,35,42,50,55,65,75,85,90,95,100,110,115,120,125,130,140][i + 1],
  unlocked: i === 0,
  completed: false,
  stars: 0,
}));

const LevelBubble = ({ level, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const isLeft = index % 2 === 0;

  return (
    <Animated.View style={[
      styles.bubbleWrapper,
      isLeft ? styles.bubbleLeft : styles.bubbleRight,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity
        style={[
          styles.bubble,
          level.completed && styles.bubbleCompleted,
          level.unlocked && !level.completed && styles.bubbleUnlocked,
          !level.unlocked && styles.bubbleLocked,
        ]}
        onPress={() => level.unlocked && onPress(level)}
        activeOpacity={level.unlocked ? 0.8 : 1}
      >
        {level.completed ? (
          <Text style={styles.bubbleCheck}>✓</Text>
        ) : level.unlocked ? (
          <Text style={styles.bubbleNumber}>{level.number}</Text>
        ) : (
          <Text style={styles.bubbleLock}>🔒</Text>
        )}
      </TouchableOpacity>

      {level.completed && (
        <View style={styles.starsRow}>
          {[1,2,3].map(s => (
            <Text key={s} style={[
              styles.star,
              s <= level.stars ? styles.starFilled : styles.starEmpty
            ]}>★</Text>
          ))}
        </View>
      )}

      <Text style={[
        styles.bubbleLabel,
        !level.unlocked && styles.bubbleLabelLocked
      ]}>
        Level {level.number}
      </Text>
    </Animated.View>
  );
};

export default function LevelMapScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleLevelPress = (level) => {
    if (level.number === 1) {
      navigation.navigate('Quiz', { level: level.number });
    } else {
      navigation.navigate('Category', { level: level.number });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Level</Text>
        <View style={styles.coinContainer}>
          <Text style={styles.coinIcon}>✦</Text>
          <Text style={styles.coinText}>0</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.mapContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pathLine} />

        {LEVELS.map((level, index) => (
          <LevelBubble
            key={level.number}
            level={level}
            index={index}
            onPress={handleLevelPress}
          />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2D1B69',
    top: -100,
    right: -80,
    opacity: 0.5,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2D1B69',
    bottom: 100,
    left: -60,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  backArrow: {
    fontSize: 20,
    color: colors.white,
  },
  headerTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    color: colors.white,
    letterSpacing: 1,
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
  coinIcon: {
    fontSize: 12,
    color: colors.gold,
  },
  coinText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.gold,
  },
  mapContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
    position: 'relative',
  },
  pathLine: {
    position: 'absolute',
    left: width / 2 - 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#2D1B69',
    zIndex: 0,
  },
  bubbleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    marginLeft: 40,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    marginRight: 40,
  },
  bubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  bubbleUnlocked: {
    backgroundColor: '#2D1B69',
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  bubbleCompleted: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  bubbleLocked: {
    backgroundColor: '#1A0A3B',
    borderColor: '#3D2B79',
  },
  bubbleNumber: {
    fontFamily: 'Nunito_900Black',
    fontSize: 24,
    color: colors.gold,
  },
  bubbleCheck: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.background,
  },
  bubbleLock: {
    fontSize: 20,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  star: {
    fontSize: 14,
  },
  starFilled: {
    color: colors.gold,
  },
  starEmpty: {
    color: '#3D2B79',
  },
  bubbleLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bubbleLabelLocked: {
    color: '#3D2B79',
  },
  bottomSpacer: {
    height: 40,
  },
});