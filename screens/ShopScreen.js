import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';
import {
  getCoins,
  spendCoins,
  getOwnedItems,
  purchaseItem,
  getEquippedItems,
  equipItem,
} from '../utils/gameStorage';

const SHOP_ITEMS = [
  {
    section: 'Avatar Frames',
    items: [
      { id: 'frame_default', name: 'Default', price: 0, icon: '⬜', description: 'Standard frame', slot: 'frame' },
      { id: 'frame_gold', name: 'Gold Frame', price: 500, icon: '🟡', description: 'Gold border on leaderboard', slot: 'frame' },
      { id: 'frame_flame', name: 'Flame Frame', price: 1500, icon: '🔥', description: 'Animated flame border', slot: 'frame' },
      { id: 'frame_diamond', name: 'Diamond Frame', price: 5000, icon: '💎', description: 'Diamond sparkle border', slot: 'frame' },
      { id: 'frame_legend', name: 'Legend Crown', price: 15000, icon: '👑', description: 'Crown for true legends', slot: 'frame' },
    ]
  },
  {
    section: 'Score Pop Style',
    items: [
      { id: 'pop_default', name: 'Default', price: 0, icon: '✨', description: 'Standard score pop', slot: 'scorePop' },
      { id: 'pop_flame', name: 'Flame Pop', price: 800, icon: '🔥', description: 'Fiery score animation', slot: 'scorePop' },
      { id: 'pop_lightning', name: 'Lightning', price: 1200, icon: '⚡', description: 'Electric score pop', slot: 'scorePop' },
      { id: 'pop_crown', name: 'Crown Pop', price: 2500, icon: '👑', description: 'Royal score animation', slot: 'scorePop' },
    ]
  },
  {
    section: 'Power-ups',
    items: [
      { id: 'powerup_skip', name: 'Skip Question', price: 150, icon: '⏭️', description: 'Skip any question, no penalty', slot: 'powerup', consumable: true },
      { id: 'powerup_5050', name: '50/50 Lifeline', price: 200, icon: '✂️', description: 'Remove two wrong answers', slot: 'powerup', consumable: true },
      { id: 'powerup_freeze', name: 'Time Freeze', price: 250, icon: '❄️', description: 'Add 5 seconds to timer', slot: 'powerup', consumable: true },
      { id: 'powerup_shield', name: 'Streak Shield', price: 300, icon: '🛡️', description: 'Protect your streak once', slot: 'powerup', consumable: true },
      { id: 'powerup_double', name: 'Double Coins', price: 400, icon: '💰', description: 'Double coins for one round', slot: 'powerup', consumable: true },
    ]
  },
];

export default function ShopScreen({ navigation }) {
  const [coins, setCoins] = useState(0);
  const [owned, setOwned] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [activeSection, setActiveSection] = useState('Avatar Frames');

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [c, o, e] = await Promise.all([
      getCoins(),
      getOwnedItems(),
      getEquippedItems(),
    ]);
    setCoins(c);
    setOwned(o);
    setEquipped(e);
  };

  const handlePurchase = async (item) => {
    if (owned.includes(item.id) && !item.consumable) {
      const result = await equipItem(item.slot, item.id);
      if (result) {
        setEquipped(result);
        Alert.alert('Equipped!', `${item.name} is now active.`);
      }
      return;
    }

    if (coins < item.price) {
      Alert.alert(
        'Not enough coins',
        `You need ${(item.price - coins).toLocaleString()} more coins.\n\nPlay more rounds or try Time Attack to earn coins faster!`
      );
      return;
    }

    Alert.alert(
      `Buy ${item.name}?`,
      `This costs ${item.price.toLocaleString()} coins.\n\nYou have ${coins.toLocaleString()} coins.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            const result = await spendCoins(item.price);
            if (result.success) {
              await purchaseItem(item.id);
              if (!item.consumable) {
                const equipped = await equipItem(item.slot, item.id);
                setEquipped(equipped);
              }
              setCoins(result.balance);
              const newOwned = await getOwnedItems();
              setOwned(newOwned);
              Alert.alert('Purchased!', `${item.name} ${item.consumable ? 'added to your inventory' : 'equipped'}.`);
            }
          }
        }
      ]
    );
  };

  if (!fontsLoaded) return null;

  const currentSection = SHOP_ITEMS.find(s => s.section === activeSection);

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
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinIcon}>✦</Text>
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.sectionTabs}>
        {SHOP_ITEMS.map(section => (
          <TouchableOpacity
            key={section.section}
            style={[
              styles.sectionTab,
              activeSection === section.section && styles.sectionTabActive
            ]}
            onPress={() => setActiveSection(section.section)}
          >
            <Text style={[
              styles.sectionTabText,
              activeSection === section.section && styles.sectionTabTextActive
            ]}>
              {section.section.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.itemsGrid}
        showsVerticalScrollIndicator={false}
      >
        {currentSection?.items.map(item => {
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped[item.slot] === item.id;
          const canAfford = coins >= item.price;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                isEquipped && styles.itemCardEquipped,
                isOwned && !isEquipped && styles.itemCardOwned,
                !isOwned && !canAfford && styles.itemCardLocked,
              ]}
              onPress={() => handlePurchase(item)}
              activeOpacity={0.8}
            >
              {isEquipped && (
                <View style={styles.equippedBadge}>
                  <Text style={styles.equippedBadgeText}>ON</Text>
                </View>
              )}

              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>

              <View style={[
                styles.itemPriceRow,
                item.price === 0 && styles.itemPriceFree,
              ]}>
                {item.price === 0 ? (
                  <Text style={styles.itemPriceFreeText}>FREE</Text>
                ) : isOwned && !item.consumable ? (
                  <Text style={styles.itemOwnedText}>
                    {isEquipped ? '✓ Equipped' : 'Tap to Equip'}
                  </Text>
                ) : (
                  <>
                    <Text style={styles.coinSymbol}>✦</Text>
                    <Text style={[
                      styles.itemPrice,
                      !canAfford && styles.itemPriceCantAfford
                    ]}>
                      {item.price.toLocaleString()}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
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
    top: -80,
    right: -80,
    opacity: 0.4,
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
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: 5,
  },
  coinIcon: {
    fontSize: 12,
    color: colors.gold,
  },
  coinText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 15,
    color: colors.gold,
  },
  sectionTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#2D1B69',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  sectionTabActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  sectionTabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionTabTextActive: {
    color: colors.background,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '47%',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3D2B79',
    position: 'relative',
    minHeight: 130,
    justifyContent: 'center',
  },
  itemCardEquipped: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '11',
  },
  itemCardOwned: {
    borderColor: '#00E5CC',
    backgroundColor: '#00E5CC11',
  },
  itemCardLocked: {
    opacity: 0.5,
  },
  equippedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.gold,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  equippedBadgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 9,
    color: colors.background,
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  itemName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 3,
  },
  itemDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  itemPriceFree: {
    backgroundColor: '#2ED57322',
  },
  coinSymbol: {
    fontSize: 10,
    color: colors.gold,
  },
  itemPrice: {
    fontFamily: 'Nunito_900Black',
    fontSize: 13,
    color: colors.gold,
  },
  itemPriceCantAfford: {
    color: colors.wrong,
  },
  itemPriceFreeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 12,
    color: colors.correct,
  },
  itemOwnedText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#00E5CC',
  },
});