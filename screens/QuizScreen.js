import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useFonts, Nunito_900Black, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { colors, categoryColors } from '../utils/theme';
import { getQuestionsForLevel, getPassMark, calculatePoints, isLastQuestion, isFinalStretch } from '../utils/questionLoader';
import { saveProgress, saveHighScore, addCoins, COIN_REWARDS } from '../utils/gameStorage';
import { saveScoreToLeaderboard } from '../utils/firestoreService';
import { getCurrentUser } from '../utils/authService';
import { playSound, playBackgroundMusic, stopBackgroundMusic, duckMusic, restoreMusic } from '../utils/soundManager';

const { width } = Dimensions.get('window');
const TIMER_DURATION = 20;

export default function QuizScreen({ navigation, route }) {
  const { level, categories } = route.params || { level: 1, categories: [] };

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [showScorePop, setShowScorePop] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef(null);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const scorePopAnim = useRef(new Animated.Value(0)).current;
  const scorePopY = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    const qs = getQuestionsForLevel(level, categories);
    setQuestions(qs);
    setIsLoading(false);
    playBackgroundMusic();
    return () => stopBackgroundMusic();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !isLoading) {
      animateQuestionIn();
      startTimer();
    }
    return () => clearTimer();
  }, [currentIndex, questions]);

  const animateQuestionIn = () => {
    questionAnim.setValue(0);
    Animated.spring(questionAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const startTimer = () => {
    clearTimer();
    setTimeLeft(TIMER_DURATION);

    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIMER_DURATION * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setStreakCount(0);
    setMultiplier(1);
    setTimeout(() => moveToNext(), 1800);
  };

  const handleAnswer = async (option) => {
    if (isAnswered) return;
    clearTimer();

    const current = questions[currentIndex];
    const isCorrect = option === current.correctAnswer;
    const points = isCorrect ? calculatePoints(timeLeft) : 0;

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (isCorrect) {
      const newStreak = streakCount + 1;
      const newMultiplier = newStreak >= 8 ? 2 : newStreak >= 5 ? 1.5 : 1;
      const finalPoints = Math.round(points * newMultiplier);
      const newScore = score + finalPoints;

      const coinEarned = timeLeft > 15
        ? COIN_REWARDS.CORRECT_FAST
        : timeLeft > 5
        ? COIN_REWARDS.CORRECT_MID
        : COIN_REWARDS.CORRECT_SLOW;

      const coinWithMultiplier = Math.round(coinEarned * newMultiplier);
      await addCoins(coinWithMultiplier);

      if (newStreak === 5) await addCoins(COIN_REWARDS.STREAK_5);
      if (newStreak === 10) await addCoins(COIN_REWARDS.STREAK_10);

      setScore(newScore);
      setCorrectCount(prev => prev + 1);
      setStreakCount(newStreak);
      setMultiplier(newMultiplier);
      setLastPoints(finalPoints);
      showScorePopAnimation(finalPoints, coinWithMultiplier);
      duckMusic();
      playSound('correct');
      playSound('coin');
      setTimeout(() => restoreMusic(), 800);

      Animated.spring(progressAnim, {
        toValue: (currentIndex + 1) / questions.length,
        useNativeDriver: false,
      }).start();
    } else {
      setStreakCount(0);
      shakeWrongAnswer();
      duckMusic();
      playSound('wrong');
      setTimeout(() => restoreMusic(), 800);
    }

    setTimeout(() => moveToNext(), 1500);
  };

  const shakeWrongAnswer = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const showScorePopAnimation = (points, coins = 0) => {
    setShowScorePop(true);
    setLastPoints(points);
    scorePopAnim.setValue(0);
    scorePopY.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(scorePopAnim, {
          toValue: 1.3,
          friction: 3,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.spring(scorePopAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scorePopY, {
        toValue: -100,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowScorePop(false);
      scorePopAnim.setValue(0);
    });
  };

  const moveToNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      finishQuiz();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const finishQuiz = async (attemptNumber = 1) => {
    const passMark = getPassMark(level);
    const passed = score >= passMark;
    const percentage = questions.length > 0 ? correctCount / questions.length : 0;
    const stars = percentage >= 0.9 ? 3 : percentage >= 0.6 ? 2 : 1;
    const isPerfect = correctCount === questions.length;

    await saveHighScore(level, score);
    const user = getCurrentUser();
    if (user) {
      await saveScoreToLeaderboard(
        user.uid,
        user.displayName || 'Player',
        level,
        score
      );
    }

    if (passed) {
      const passBonus = attemptNumber === 1
        ? COIN_REWARDS.LEVEL_PASS_FIRST
        : COIN_REWARDS.LEVEL_PASS_SECOND;
      await addCoins(passBonus);
      if (stars === 3) await addCoins(COIN_REWARDS.THREE_STARS);
      if (isPerfect) await addCoins(COIN_REWARDS.PERFECT_ROUND);
      await saveProgress(level, stars, score);

      navigation.replace('Win', {
        level,
        score,
        correct: correctCount,
        total: questions.length,
        stars,
        passBonus,
        isPerfect,
      });
    } else {
      navigation.replace('GameOver', {
        level,
        score,
        passMark,
        categories,
      });
    }
  };

  if (!fontsLoaded || isLoading || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const current = questions[currentIndex];
  const catColor = categoryColors[current.category] || colors.gold;
  const timerColor = timeLeft > 10 ? colors.timerGreen : timeLeft > 5 ? colors.timerAmber : colors.timerRed;
  const timerCircumference = 2 * Math.PI * 28;

  const getButtonStyle = (option) => {
    if (!isAnswered) return styles.optionBtn;
    if (option === selectedAnswer && option === current.correctAnswer) {
      return [styles.optionBtn, styles.optionCorrect];
    }
    if (option === selectedAnswer && option !== current.correctAnswer) {
      return [styles.optionBtn, styles.optionWrong];
    }
    return [styles.optionBtn, styles.optionDimmed];
  };

  const getButtonTextStyle = (option) => {
    if (!isAnswered) return styles.optionText;
    if (option === selectedAnswer && option === current.correctAnswer) {
      return [styles.optionText, styles.optionTextCorrect];
    }
    if (option === selectedAnswer && option !== current.correctAnswer) {
      return [styles.optionText, styles.optionTextWrong];
    }
    return [styles.optionText, styles.optionTextDimmed];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgCircle1} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.quitBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }]} />
          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        <View style={styles.scorePill}>
          <Text style={styles.scoreIcon}>✦</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <View style={styles.timerRow}>
        <View style={styles.timerContainer}>
          <View style={[styles.timerRing, { borderColor: timerColor }]}>
            <Text style={[styles.timerNumber, { color: timerColor }]}>
              {timeLeft}
            </Text>
          </View>
        </View>

         {streakCount >= 3 && (
          <View style={[
            styles.streakBadge,
            multiplier >= 2 && { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
          ]}>
            <Text style={[
              styles.streakText,
              multiplier >= 2 && { color: colors.gold },
            ]}>
              {multiplier >= 2 ? '⚡ 2x POINTS!' : multiplier >= 1.5 ? '🔥 1.5x' : `🔥 ${streakCount} streak!`}
            </Text>
          </View>
        )}
      </View>

      <Animated.View style={[
        styles.questionCard,
        isFinalStretch(currentIndex, questions.length) && styles.questionCardStretch,
        isLastQuestion(currentIndex, questions.length) && styles.questionCardFinal,
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

        {isLastQuestion(currentIndex, questions.length) && (
          <View style={styles.finalBadge}>
            <Text style={styles.finalBadgeText}>⭐ FINAL QUESTION</Text>
          </View>
        )}

        {isFinalStretch(currentIndex, questions.length) &&
          !isLastQuestion(currentIndex, questions.length) && (
          <View style={styles.stretchBadge}>
            <Text style={styles.stretchBadgeText}>🔥 FINAL STRETCH</Text>
          </View>
        )}

        <View style={[styles.categoryBadge, { backgroundColor: catColor + '22', borderColor: catColor }]}>
          <Text style={[styles.categoryText, { color: catColor }]}>
            {current.category}
          </Text>
        </View>

        <Text style={styles.questionText}>{current.question}</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {current.options.map((option, index) => (
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
            {isAnswered && option === selectedAnswer && option === current.correctAnswer && (
              <Text style={styles.correctTick}>✓</Text>
            )}
            {isAnswered && option === selectedAnswer && option !== current.correctAnswer && (
              <Text style={styles.wrongCross}>✕</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {showScorePop && (
       <Animated.View style={[
        styles.scorePop,
        {
          opacity: scorePopAnim,
          transform: [
            { scale: scorePopAnim },
            { translateY: scorePopY },
          ],
        }
      ]}>
        <Text style={styles.scorePopText}>+{lastPoints} pts</Text>
        <Text style={styles.coinPopText}>✦ +{Math.round(lastPoints * 2)} coins</Text>
      </Animated.View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D1B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  quitText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    flex: 1,
    height: 36,
    backgroundColor: '#2D1B69',
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#3D2B79',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.gold + '44',
    borderRadius: 18,
  },
  progressText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 13,
    color: colors.white,
    zIndex: 1,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: 5,
  },
  scoreIcon: {
    fontSize: 10,
    color: colors.gold,
  },
  scoreText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.gold,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D1B69',
  },
  timerNumber: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
  },
  streakBadge: {
    backgroundColor: '#FF6348' + '33',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FF6348',
  },
  streakText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#FF6348',
  },
  questionCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#3D2B79',
    minHeight: 140,
    justifyContent: 'center',
  },
  questionCardFinal: {
    borderColor: colors.gold,
    borderWidth: 2.5,
  },
  questionCardStretch: {
    borderColor: colors.candy1,
    borderWidth: 2,
  },
  finalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold + '22',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  finalBadgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1,
  },
  stretchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.candy1 + '22',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.candy1,
  },
  stretchBadgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 10,
    color: colors.candy1,
    letterSpacing: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  questionText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: colors.white,
    lineHeight: 26,
  },
  optionsContainer: {
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
  correctTick: {
    fontSize: 18,
    color: colors.correct,
    fontWeight: '900',
  },
  wrongCross: {
    fontSize: 16,
    color: colors.wrong,
    fontWeight: '900',
  },
  scorePop: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
  },
  scorePopText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.background,
  },
  coinPopText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.background,
    textAlign: 'center',
    opacity: 0.8,
  },
});