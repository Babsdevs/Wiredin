import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors, categoryColors } from '../utils/theme';
import { getQuestionsForLevel, getPassMark } from '../utils/questionLoader';
import { addCoins, COIN_REWARDS } from '../utils/gameStorage';
import { playSound, duckMusic, restoreMusic } from '../utils/soundManager';

const TIME_ATTACK_DURATION = 60;
const QUESTIONS_NEEDED = 5;

export default function TimeAttackScreen({ navigation }) {
  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_DURATION);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  const timerRef = useRef(null);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    const allQs = [];
    for (let i = 1; i <= 20; i++) {
      const qs = getQuestionsForLevel(i, []);
      allQs.push(...qs);
    }
    const shuffled = allQs.sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 20));
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      startTimer();
      animateQuestion();
    }
    return () => clearInterval(timerRef.current);
  }, [phase, currentIndex]);

  const startTimer = () => {
    if (currentIndex === 0) {
      timerAnim.setValue(1);
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: TIME_ATTACK_DURATION * 1000,
        useNativeDriver: false,
      }).start();

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const animateQuestion = () => {
    questionAnim.setValue(0);
    Animated.spring(questionAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleAnswer = async (option) => {
    if (isAnswered || sessionComplete) return;

    const current = questions[currentIndex];
    const isCorrect = option === current.correctAnswer;

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (isCorrect) {
      const coins = COIN_REWARDS.TIME_ATTACK_CORRECT;
      setCoinsEarned(prev => prev + coins);
      setCorrectCount(prev => prev + 1);
      await addCoins(coins);
      duckMusic();
      playSound('correct');
      setTimeout(() => restoreMusic(), 600);
    } else {
      duckMusic();
      playSound('wrong');
      setTimeout(() => restoreMusic(), 600);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      setIsAnswered(false);
      setSelectedAnswer(null);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= QUESTIONS_NEEDED || nextIndex >= questions.length) {
        endSession();
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 800);
  };

  const endSession = async () => {
    clearInterval(timerRef.current);
    setSessionComplete(true);
    setPhase('results');

    const isPerfect = correctCount >= QUESTIONS_NEEDED;
    const isSpeedBonus = timeLeft > 30;

    let bonusCoins = 0;
    if (correctCount === QUESTIONS_NEEDED) {
      bonusCoins += COIN_REWARDS.TIME_ATTACK_PERFECT;
      await addCoins(COIN_REWARDS.TIME_ATTACK_PERFECT);
    } else if (correctCount >= 3) {
      bonusCoins += COIN_REWARDS.TIME_ATTACK_COMPLETE;
      await addCoins(COIN_REWARDS.TIME_ATTACK_COMPLETE);
    }

    if (isSpeedBonus && correctCount >= 3) {
      bonusCoins += COIN_REWARDS.TIME_ATTACK_SPEED;
      await addCoins(COIN_REWARDS.TIME_ATTACK_SPEED);
    }

    setCoinsEarned(prev => prev + bonusCoins);
    playSound('levelwin');
  };

  if (!fontsLoaded || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.introContent}>
          <Text style={styles.introIcon}>⚡</Text>
          <Text style={styles.introTitle}>TIME ATTACK</Text>
          <Text style={styles.introSub}>5 questions. 60 seconds. Maximum coins.</Text>

          <View style={styles.rulesCard}>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>✓</Text>
              <Text style={styles.ruleText}>Each correct answer earns 35 coins</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>⚡</Text>
              <Text style={styles.ruleText}>5/5 correct earns 500 bonus coins</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>🚀</Text>
              <Text style={styles.ruleText}>Finish in under 30s for speed bonus</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>🔒</Text>
              <Text style={styles.ruleText}>No answer reveals — jeopardy stays</Text>
            </View>
          </View>

          <View style={styles.earningBox}>
            <Text style={styles.earningTitle}>Maximum possible earnings</Text>
            <Text style={styles.earningAmount}>✦ 1,175 coins</Text>
            <Text style={styles.earningBreak}>175 correct + 500 perfect + 300 speed</Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => setPhase('playing')}
          >
            <Text style={styles.startBtnText}>⚡ START NOW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const isPerfect = correctCount === QUESTIONS_NEEDED;
    return (
      <View style={styles.container}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.resultsContent}>
          <Text style={styles.resultIcon}>{isPerfect ? '🏆' : correctCount >= 3 ? '⭐' : '💪'}</Text>
          <Text style={styles.resultTitle}>
            {isPerfect ? 'PERFECT!' : correctCount >= 3 ? 'WELL DONE!' : 'KEEP GOING!'}
          </Text>
          <Text style={styles.resultSub}>
            {correctCount} out of {QUESTIONS_NEEDED} correct
          </Text>

          <View style={styles.coinsEarnedCard}>
            <Text style={styles.coinsEarnedLabel}>Coins Earned</Text>
            <Text style={styles.coinsEarnedAmount}>✦ {coinsEarned.toLocaleString()}</Text>
          </View>

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{correctCount}</Text>
              <Text style={styles.resultStatLabel}>Correct</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>
                {TIME_ATTACK_DURATION - timeLeft}s
              </Text>
              <Text style={styles.resultStatLabel}>Time Used</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color: colors.gold }]}>
                {coinsEarned}
              </Text>
              <Text style={styles.resultStatLabel}>Coins</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.playAgainBtn}
            onPress={() => {
              setPhase('playing');
              setCurrentIndex(0);
              setTimeLeft(TIME_ATTACK_DURATION);
              setCoinsEarned(0);
              setCorrectCount(0);
              setSessionComplete(false);
              setIsAnswered(false);
              setSelectedAnswer(null);
              timerAnim.setValue(1);
            }}
          >
            <Text style={styles.playAgainBtnText}>⚡ PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const current = questions[currentIndex];
  const catColor = categoryColors[current?.category] || colors.gold;
  const timerColor = timeLeft > 30 ? colors.timerGreen : timeLeft > 10 ? colors.timerAmber : colors.timerRed;
  const timerWidth = (timeLeft / TIME_ATTACK_DURATION) * 100;

  const getButtonStyle = (option) => {
    if (!isAnswered) return styles.optionBtn;
    if (option === selectedAnswer && option === current.correctAnswer) return [styles.optionBtn, styles.optionCorrect];
    if (option === selectedAnswer && option !== current.correctAnswer) return [styles.optionBtn, styles.optionWrong];
    return [styles.optionBtn, styles.optionDimmed];
  };

  const getButtonTextStyle = (option) => {
    if (!isAnswered) return styles.optionText;
    if (option === selectedAnswer && option === current.correctAnswer) return [styles.optionText, styles.optionTextCorrect];
    if (option === selectedAnswer && option !== current.correctAnswer) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDimmed];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgCircle1} />

      <View style={styles.attackHeader}>
        <View style={styles.attackBadge}>
          <Text style={styles.attackBadgeText}>⚡ TIME ATTACK</Text>
        </View>
        <View style={styles.attackStats}>
          <Text style={styles.attackCoins}>✦ {coinsEarned}</Text>
          <Text style={styles.attackProgress}>{currentIndex + 1}/{QUESTIONS_NEEDED}</Text>
        </View>
      </View>

      <View style={styles.timerBarContainer}>
        <Animated.View style={[
          styles.timerBar,
          {
            width: `${timerWidth}%`,
            backgroundColor: timerColor,
          }
        ]} />
        <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
      </View>

      <Animated.View style={[
        styles.questionCard,
        {
          opacity: questionAnim,
          transform: [
            { translateX: shakeAnim },
            {
              translateY: questionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }
          ]
        }
      ]}>
        <View style={[styles.categoryBadge, { backgroundColor: catColor + '22', borderColor: catColor }]}>
          <Text style={[styles.categoryText, { color: catColor }]}>{current?.category}</Text>
        </View>
        <Text style={styles.questionText}>{current?.question}</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {current?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getButtonStyle(option)}
            onPress={() => handleAnswer(option)}
            activeOpacity={isAnswered ? 1 : 0.8}
          >
            <View style={styles.optionLabelCircle}>
              <Text style={styles.optionLabel}>
                {['A', 'B', 'C', 'D'][index]}
              </Text>
            </View>
            <Text style={getButtonTextStyle(option)} numberOfLines={2}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
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
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2D1B69',
    bottom: -60,
    left: -60,
    opacity: 0.3,
  },
  loadingText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 200,
  },
  introContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  introIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  introTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 36,
    color: colors.gold,
    letterSpacing: 4,
    marginBottom: 8,
  },
  introSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  rulesCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3D2B79',
    gap: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  ruleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.white,
    flex: 1,
  },
  earningBox: {
    backgroundColor: colors.gold + '22',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  earningTitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  earningAmount: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.gold,
  },
  earningBreak: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  startBtn: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  startBtnText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: colors.background,
    letterSpacing: 3,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  attackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  attackBadge: {
    backgroundColor: colors.gold + '22',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  attackBadgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 1,
  },
  attackStats: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  attackCoins: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.gold,
  },
  attackProgress: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.white,
  },
  timerBarContainer: {
    marginHorizontal: 20,
    height: 40,
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  timerBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.5,
  },
  timerText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    textAlign: 'center',
    zIndex: 1,
  },
  questionCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.gold,
    minHeight: 130,
    justifyContent: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  categoryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },
  questionText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  optionBtn: {
    backgroundColor: '#2D1B69',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#3D2B79',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCorrect: {
    backgroundColor: colors.correct + '22',
    borderColor: colors.correct,
  },
  optionWrong: {
    backgroundColor: colors.wrong + '22',
    borderColor: colors.wrong,
  },
  optionDimmed: {
    opacity: 0.4,
  },
  optionLabelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3D2B79',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLabel: {
    fontFamily: 'Nunito_900Black',
    fontSize: 12,
    color: colors.textSecondary,
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.white,
    flex: 1,
  },
  optionTextCorrect: {
    color: colors.correct,
  },
  optionTextWrong: {
    color: colors.wrong,
  },
  optionTextDimmed: {
    color: colors.textSecondary,
  },
  resultsContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 32,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 6,
  },
  resultSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  coinsEarnedCard: {
    backgroundColor: colors.gold + '22',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
    marginBottom: 20,
    width: '100%',
  },
  coinsEarnedLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  coinsEarnedAmount: {
    fontFamily: 'Nunito_900Black',
    fontSize: 42,
    color: colors.gold,
  },
  resultStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 24,
    color: colors.white,
  },
  resultStatLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultStatDivider: {
    width: 1,
    backgroundColor: '#3D2B79',
  },
  playAgainBtn: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  playAgainBtnText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: colors.background,
    letterSpacing: 3,
  },
  homeBtn: {
    borderRadius: 30,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  homeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
});