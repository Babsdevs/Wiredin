import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';
import { setMuted, getMuted, setMusicVolume } from '../utils/soundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOLUME_LEVELS = [
  { label: 'Off', value: 0 },
  { label: 'Quiet', value: 0.15 },
  { label: 'Medium', value: 0.3 },
  { label: 'Loud', value: 0.6 },
];

export default function SettingsScreen({ navigation }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicLevel, setMusicLevel] = useState(2);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await AsyncStorage.getItem('wiredin_settings');
      if (s) {
        const parsed = JSON.parse(s);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setMusicLevel(parsed.musicLevel ?? 2);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
      }
    } catch (e) {}
  };

  const saveSettings = async (key, value) => {
    try {
      const s = await AsyncStorage.getItem('wiredin_settings');
      const current = s ? JSON.parse(s) : {};
      await AsyncStorage.setItem('wiredin_settings', JSON.stringify({
        ...current,
        [key]: value,
      }));
    } catch (e) {}
  };

  const handleSoundToggle = (value) => {
    setSoundEnabled(value);
    setMuted(!value);
    saveSettings('soundEnabled', value);
  };

  const handleMusicLevel = (index) => {
    setMusicLevel(index);
    setMusicVolume(VOLUME_LEVELS[index].value);
    saveSettings('musicLevel', index);
  };

  if (!fontsLoaded) return null;

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.sectionTitle}>AUDIO</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Sound Effects</Text>
            <Text style={styles.settingDesc}>Correct, wrong and UI sounds</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={handleSoundToggle}
            trackColor={{ false: '#3D2B79', true: colors.gold }}
            thumbColor={soundEnabled ? colors.background : '#888'}
          />
        </View>

        <View style={styles.settingBlock}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Music Volume</Text>
            <Text style={styles.settingDesc}>Background gameplay music</Text>
          </View>
          <View style={styles.volumeRow}>
            {VOLUME_LEVELS.map((level, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.volumeBtn,
                  musicLevel === index && styles.volumeBtnActive,
                ]}
                onPress={() => handleMusicLevel(index)}
              >
                <Text style={[
                  styles.volumeBtnText,
                  musicLevel === index && styles.volumeBtnTextActive,
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Lives refilled, new questions, events</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              saveSettings('notificationsEnabled', value);
            }}
            trackColor={{ false: '#3D2B79', true: colors.gold }}
            thumbColor={notificationsEnabled ? colors.background : '#888'}
          />
        </View>

        <Text style={styles.sectionTitle}>GAMEPLAY</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚡</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Hot Streak Multiplier</Text>
            <Text style={styles.infoDesc}>
              3 in a row — normal points{'\n'}
              5 in a row — 1.5x points{'\n'}
              8 in a row — 2x points
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>No Answer Reveals</Text>
            <Text style={styles.infoDesc}>
              Wrong answers are never shown.{'\n'}
              Replay levels to discover them yourself.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>WIRED IN</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutTagline}>Know Everything. Miss Nothing.</Text>
        </View>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Contact Us</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

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
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3D2B79',
    gap: 12,
  },
  settingBlock: {
    backgroundColor: '#2D1B69',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3D2B79',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  settingDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  volumeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  volumeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  volumeBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  volumeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
  },
  volumeBtnTextActive: {
    color: colors.background,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#2D1B69',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3D2B79',
    gap: 14,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.white,
    marginBottom: 4,
  },
  infoDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  aboutCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 14,
    padding: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    gap: 4,
  },
  aboutTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 24,
    color: colors.gold,
    letterSpacing: 4,
  },
  aboutVersion: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  aboutTagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2D1B69',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  linkText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  linkArrow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});