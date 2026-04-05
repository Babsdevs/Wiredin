import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors } from '../utils/theme';
import { registerWithEmail, loginWithEmail } from '../utils/authService';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isLogin && !username) {
      setError('Please enter a username');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = isLogin
      ? await loginWithEmail(email, password)
      : await registerWithEmail(email, password, username);
    setLoading(false);
    if (result.error) {
      if (result.error.includes('user-not-found') || result.error.includes('invalid-credential')) {
        setError('No account found with this email or password');
      } else if (result.error.includes('wrong-password')) {
        setError('Incorrect password');
      } else if (result.error.includes('email-already-in-use')) {
        setError('An account already exists with this email');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>QUIZ</Text>
          </View>
          <Text style={styles.logoTop}>WIRED</Text>
          <View style={styles.logoBottomRow}>
            <View style={styles.goldLine} />
            <Text style={styles.logoBottom}>IN</Text>
            <View style={styles.goldLine} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => { setIsLogin(true); setError(''); }}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => { setIsLogin(false); setError(''); }}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Your display name"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.submitBtnText}>
                {isLogin ? 'SIGN IN ▶' : 'CREATE ACCOUNT ▶'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.guestText}>Continue as Guest</Text>
          <Text style={styles.guestSub}>Scores won't appear on leaderboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 11,
    color: colors.background,
    letterSpacing: 4,
  },
  logoTop: {
    fontFamily: 'Nunito_900Black',
    fontSize: 52,
    color: colors.white,
    letterSpacing: 10,
    lineHeight: 56,
  },
  logoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  goldLine: {
    width: 36,
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  logoBottom: {
    fontFamily: 'Nunito_900Black',
    fontSize: 52,
    color: colors.gold,
    letterSpacing: 10,
    lineHeight: 56,
  },
  card: {
    backgroundColor: '#2D1B69',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#3D2B79',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.white,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  errorBox: {
    backgroundColor: colors.wrong + '22',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.wrong,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.wrong,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.background,
    letterSpacing: 2,
  },
  guestBtn: {
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  guestText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  guestSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#3D2B79',
  },
});