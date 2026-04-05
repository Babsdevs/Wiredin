import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors, categoryColors } from '../utils/theme';

const CATEGORIES = [
  { name: 'TV Shows', icon: '📺' },
  { name: 'Sports', icon: '⚽' },
  { name: 'YouTube & Tech', icon: '💻' },
  { name: 'History', icon: '🌍' },
  { name: 'Celebrities', icon: '⭐' },
  { name: 'Music', icon: '🎵' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Star Wars', icon: '🚀' },
  { name: 'Science', icon: '🔬' },
  { name: 'Food & Culture', icon: '🍕' },
];

const CategoryCard = ({ category, selected, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const selectAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 60,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.spring(selectAnim, {
      toValue: selected ? 1.05 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const catColor = categoryColors[category.name] || colors.gold;

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }, { scale: selectAnim }],
      width: '47%',
    }}>
      <TouchableOpacity
        style={[
          styles.card,
          selected && { borderColor: catColor, borderWidth: 2.5 },
          selected && { backgroundColor: catColor + '22' },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {selected && (
          <View style={[styles.checkBadge, { backgroundColor: catColor }]}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
        <Text style={styles.cardIcon}>{category.icon}</Text>
        <Text style={[styles.cardName, selected && { color: catColor }]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CategoryScreen({ navigation, route }) {
  const { level } = route.params || { level: 2 };
  const [selected, setSelected] = useState([]);

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const toggleCategory = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name));
    } else if (selected.length < 5) {
      setSelected([...selected, name]);
    }
  };

  const canStart = selected.length === 5;

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pick Categories</Text>
          <Text style={styles.headerSub}>Level {level}</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{selected.length}/5</Text>
        </View>
      </View>

      <View style={styles.mathsBanner}>
        <Text style={styles.mathsIcon}>🔒</Text>
        <View style={styles.mathsTextContainer}>
          <Text style={styles.mathsTitle}>Maths — Always Included</Text>
          <Text style={styles.mathsSub}>15% of every round is always Maths</Text>
        </View>
        <View style={styles.mathsBadge}>
          <Text style={styles.mathsBadgeText}>✦</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat, index) => (
          <CategoryCard
            key={cat.name}
            category={cat}
            selected={selected.includes(cat.name)}
            onPress={() => toggleCategory(cat.name)}
            index={index}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {!canStart && (
          <Text style={styles.footerHint}>
            Select {5 - selected.length} more {5 - selected.length === 1 ? 'category' : 'categories'}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={() => canStart && navigation.navigate('Countdown', {
            level,
            categories: [...selected, 'Maths'],
          })}
          activeOpacity={canStart ? 0.8 : 1}
        >
          <Text style={[styles.startBtnText, !canStart && styles.startBtnTextDisabled]}>
            {canStart ? 'START ROUND ▶' : 'Choose 5 Categories'}
          </Text>
        </TouchableOpacity>
      </View>
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
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    gap: 12,
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
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    color: colors.white,
  },
  headerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  counterBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.background,
  },
  mathsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: 10,
  },
  mathsIcon: {
    fontSize: 20,
  },
  mathsTextContainer: {
    flex: 1,
  },
  mathsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.gold,
  },
  mathsSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  mathsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mathsBadgeText: {
    fontSize: 14,
    color: colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3D2B79',
    position: 'relative',
    minHeight: 90,
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 11,
    color: colors.background,
    fontWeight: '900',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 8,
    gap: 8,
  },
  footerHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnDisabled: {
    backgroundColor: '#2D1B69',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  startBtnText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.background,
    letterSpacing: 2,
  },
  startBtnTextDisabled: {
    color: colors.textSecondary,
  },
});