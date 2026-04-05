import { useState, useEffect } from 'react';
import { View } from 'react-native';

const IS_TESTING = true;

export const AD_UNIT_IDS = {
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  banner: 'ca-app-pub-3940256099942544/6300978111',
};

export function BannerAd({ style }) {
  return null;
}

export const BannerAdSize = {
  BANNER: 'BANNER',
};

export function preloadInterstitial() {
  console.log('Ad preloaded — will show on production build');
}

export async function showInterstitial() {
  console.log('Interstitial ad — will show on production build');
  return true;
}

export async function showRewardedAd() {
  console.log('Rewarded ad — will show on production build');
  return { earned: true };
}
