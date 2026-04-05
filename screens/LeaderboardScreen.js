import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';
import { getGlobalLeaderboard, getWeeklyLeaderboard } from '../utils/firestoreService';
import { getCurrentUser } from '../utils/authService';

const MOCK_DATA = [
  { rank: 1, name: 'QuizKing99', level: 18, score: 2840, initials: 'QK' },
  { rank: 2, name: 'BrainzOnFire', level: 16, score: 2650, initials: 'BF' },
  { rank: 3, name: 'WiredUp', level: 15, score: 2410, initials: 'WU' },
  { rank: 4, name: 'CelebGuru', level: 14, score: 2200, initials: 'CG' },
  { rank: 5, name: 'MathsWiz', level: 13, score: 2050, initials: 'MW' },
  { rank: 6, name: 'PopCulture', level: 12, score: 1980, initials: 'PC' },
  { rank: 7, name: 'TriviaBoss', level: 11, score: 1820, initials: 'TB' },
  { rank: 8, name: 'StarPlayer', level: 10, score: 1740, initials: 'SP' },
  { rank: 9, name: 'QuizPro', level: 9, score: 1650, initials: 'QP' },
  { rank: 10, name: 'KnowItAll', level: 8, score: 1540, initials: 'KA' },
];

const CROWN_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = activeTab === 'Weekly'
        ? await getWeeklyLeaderboard()
        : await getGlobalLeaderboard();
      setLeaderboardData(data);
    } catch (e) {
      setLeaderboardData([]);
    }
    setLoading(false);
  };
  if (!fontsLoaded) return null;

  const tabs = ['Global', 'Weekly', 'Friends'];

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
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.topThree}>
        {leaderboardData.length >= 3 && [1, 0, 2].map((orderIndex, i) => {
          const p = leaderboardData[orderIndex];
          if (!p) return null;
          const isFirst = order[i] === 0;
          return (
            <View key={p.rank} style={[styles.podiumItem, isFirst && styles.podiumFirst]}>
              <Text style={styles.crownIcon}>👑</Text>
              <View style={[styles.podiumAvatar, { borderColor: CROWN_COLORS[order[i]] }]}>
                <Text style={styles.podiumInitials}>{p.initials}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{p.name}</Text>
              <Text style={[styles.podiumScore, { color: CROWN_COLORS[order[i]] }]}>
                {p.score}
              </Text>
              <View style={[styles.podiumBase, {
                height: isFirst ? 60 : order[i] === 1 ? 45 : 30,
                backgroundColor: CROWN_COLORS[order[i]] + '33',
                borderColor: CROWN_COLORS[order[i]],
              }]}>
                <Text style={[styles.podiumRank, { color: CROWN_COLORS[order[i]] }]}>
                  #{p.rank}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 14 }}>
              Loading...
            </Text>
          </View>
        ) : leaderboardData.slice(3).map(player => (
          <View key={player.rank} style={styles.row}>
            <Text style={styles.rowRank}>#{player.rank}</Text>
            <View style={styles.rowAvatar}>
              <Text style={styles.rowInitials}>{player.initials}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{player.name}</Text>
              <Text style={styles.rowLevel}>Level {player.level}</Text>
            </View>
            <Text style={styles.rowScore}>{player.score}</Text>
          </View>
        ))}

        <View style={styles.yourRow}>
          <Text style={styles.rowRank}>#—</Text>
          <View style={[styles.rowAvatar, { backgroundColor: colors.gold + '33', borderColor: colors.gold }]}>
            <Text style={[styles.rowInitials, { color: colors.gold }]}>
              {currentUser?.displayName?.slice(0, 2).toUpperCase() || 'YOU'}
            </Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowName, { color: colors.gold }]}>
              {currentUser?.displayName || 'Guest Player'}
            </Text>
            <Text style={styles.rowLevel}>
              {currentUser ? 'Keep playing to rank up' : 'Sign in to appear here'}
            </Text>
          </View>
          <Text style={[styles.rowScore, { color: colors.gold }]}>0</Text>
        </View>

        <View style={{ height: 24 }} />
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
    opacity: 0.5,
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
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.background,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumFirst: {
    marginBottom: 16,
  },
  crownIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2D1B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  podiumInitials: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
    color: colors.white,
  },
  podiumName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: colors.white,
    marginBottom: 2,
  },
  podiumScore: {
    fontFamily: 'Nunito_900Black',
    fontSize: 13,
    marginBottom: 4,
  },
  podiumBase: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  rowRank: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
    color: colors.textSecondary,
    width: 32,
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3D2B79',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4D3B89',
  },
  rowInitials: {
    fontFamily: 'Nunito_900Black',
    fontSize: 11,
    color: colors.white,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.white,
  },
  rowLevel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rowScore: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.white,
  },
  yourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold + '11',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginTop: 4,
  },
});