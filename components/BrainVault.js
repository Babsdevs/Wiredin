import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getVaultTier, getNextVaultTier } from '../utils/gameStorage';
import { colors } from '../utils/theme';

export default function BrainVault({ totalCoins, compact = false }) {
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const tier = getVaultTier(totalCoins || 0);
  const next = getNextVaultTier(totalCoins || 0);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const progressPercent = next
    ? ((totalCoins - tier.min) / (next.min - tier.min)) * 100
    : 100;

  if (compact) {
    return (
      <View style={styles.compact}>
        <Animated.Text style={[styles.compactIcon, { opacity: glowAnim }]}>
          {tier.icon}
        </Animated.Text>
        <Text style={[styles.compactName, { color: tier.color }]}>
          {tier.name}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.vaultCard, { borderColor: tier.color }]}>
        <Animated.Text style={[styles.vaultIcon, { opacity: glowAnim }]}>
          {tier.icon}
        </Animated.Text>
        <View style={styles.vaultInfo}>
          <Text style={[styles.tierName, { color: tier.color }]}>
            {tier.name}
          </Text>
          <Text style={styles.coinsText}>
            ✦ {(totalCoins || 0).toLocaleString()} coins
          </Text>
          {next && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, progressPercent)}%`,
                    backgroundColor: tier.color,
                  }
                ]} />
              </View>
              <Text style={styles.progressLabel}>
                {(next.min - (totalCoins || 0)).toLocaleString()} coins to {next.name}
              </Text>
            </View>
          )}
          {!next && (
            <Text style={styles.legendText}>Maximum tier reached 👑</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 14,
  },
  vaultIcon: {
    fontSize: 40,
  },
  vaultInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  coinsText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.gold,
    marginBottom: 8,
  },
  progressSection: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  legendText: {
    fontSize: 11,
    color: colors.gold,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactIcon: {
    fontSize: 16,
  },
  compactName: {
    fontSize: 11,
    fontWeight: '800',
  },
});