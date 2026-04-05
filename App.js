import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { loadSounds } from './utils/soundManager';

export default function App() {
  useEffect(() => {
    loadSounds();
  }, []);

  return <AppNavigator />;
}