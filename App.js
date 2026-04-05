import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { loadSounds } from './utils/soundManager';
import { preloadInterstitial } from './utils/adManager';

export default function App() {
  useEffect(() => {
    loadSounds();
    preloadInterstitial();
  }, []);

  return <AppNavigator />;
}