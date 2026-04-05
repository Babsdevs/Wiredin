import level1 from '../data/level1.json';
import level2 from '../data/level2.json';
import level3 from '../data/level3.json';
import level4 from '../data/level4.json';
import level5 from '../data/level5.json';
import level6 from '../data/level6.json';
import level7 from '../data/level7.json';
import level8 from '../data/level8.json';
import level9 from '../data/level9.json';
import level10 from '../data/level10.json';
import level11 from '../data/level11.json';
import level12 from '../data/level12.json';
import level13 from '../data/level13.json';
import level14 from '../data/level14.json';
import level15 from '../data/level15.json';
import level16 from '../data/level16.json';
import level17 from '../data/level17.json';
import level18 from '../data/level18.json';
import level19 from '../data/level19.json';
import level20 from '../data/level20.json';

const ALL_LEVELS = {
  1: level1, 2: level2, 3: level3, 4: level4, 5: level5,
  6: level6, 7: level7, 8: level8, 9: level9, 10: level10,
  11: level11, 12: level12, 13: level13, 14: level14, 15: level15,
  16: level16, 17: level17, 18: level18, 19: level19, 20: level20,
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cleanOptions(options) {
  return options.map(opt =>
    opt.replace(/^[A-D]\)\s*/i, '').trim()
  );
}

function cleanAnswer(answer) {
  return answer.replace(/^[A-D]\)\s*/i, '').trim();
}

function getDifficultyScore(q) {
  const d = q.difficulty || 'medium';
  if (d === 'easy') return 1;
  if (d === 'medium') return 2;
  return 3;
}

function buildProgressiveOrder(questions, total) {
  const easy = questions.filter(q => (q.difficulty || 'medium') === 'easy');
  const medium = questions.filter(q => (q.difficulty || 'medium') === 'medium');
  const hard = questions.filter(q => (q.difficulty || 'medium') === 'hard');

  const warmupCount = Math.max(1, Math.round(total * 0.25));
  const midCount = Math.max(1, Math.round(total * 0.50));
  const finalCount = total - warmupCount - midCount;

  const warmup = shuffle(easy.length >= warmupCount ? easy : [...easy, ...medium])
    .slice(0, warmupCount);

  const remaining = questions.filter(q => !warmup.includes(q));
  const mid = shuffle(remaining.filter(q =>
    (q.difficulty || 'medium') === 'easy' ||
    (q.difficulty || 'medium') === 'medium'
  )).slice(0, midCount);

  const remaining2 = remaining.filter(q => !mid.includes(q));
  const finals = shuffle(
    remaining2.length >= finalCount
      ? remaining2
      : [...remaining2, ...shuffle(medium)]
  ).slice(0, finalCount);

  return [...warmup, ...mid, ...finals];
}

export function getQuestionsForLevel(levelNumber, selectedCategories = []) {
  const levelData = ALL_LEVELS[levelNumber];
  if (!levelData) return [];

  const allQuestions = levelData.questionList || [];

  const mathsQs = allQuestions.filter(q =>
    q.category === 'Maths' || q.category === 'Math'
  );
  const otherQs = allQuestions.filter(q =>
    q.category !== 'Maths' && q.category !== 'Math'
  );

  const totalNeeded = allQuestions.length;
  const mathsNeeded = Math.max(1, Math.round(totalNeeded * 0.15));
  const otherNeeded = totalNeeded - mathsNeeded;

  let filteredOther = otherQs;
  if (selectedCategories.length > 0) {
    const cats = selectedCategories.filter(c => c !== 'Maths' && c !== 'Math');
    const catFiltered = otherQs.filter(q => cats.includes(q.category));
    filteredOther = catFiltered.length >= otherNeeded ? catFiltered : otherQs;
  }

  const selectedMaths = shuffle(mathsQs).slice(0, mathsNeeded);
  const selectedOther = filteredOther.slice(0, otherNeeded);

  const combined = [...selectedMaths, ...selectedOther];

  const progressive = buildProgressiveOrder(combined, combined.length);

  return progressive.map(q => ({
    ...q,
    options: cleanOptions(q.options || []),
    correctAnswer: cleanAnswer(q.correctAnswer || ''),
  }));
}

export function getPassMark(levelNumber) {
  const marks = {
    1: 15, 2: 20, 3: 25, 4: 30, 5: 35,
    6: 55, 7: 65, 8: 72, 9: 80, 10: 92,
    11: 105, 12: 112, 13: 118, 14: 125, 15: 135,
    16: 142, 17: 150, 18: 158, 19: 165, 20: 175,
  };
  return marks[levelNumber] || 15;
}

export function calculatePoints(timeRemaining) {
  if (timeRemaining > 15) return 7;
  if (timeRemaining > 5) return 5;
  if (timeRemaining > 0) return 2;
  return 0;
}

export function isLastQuestion(currentIndex, totalQuestions) {
  return currentIndex === totalQuestions - 1;
}

export function isFinalStretch(currentIndex, totalQuestions) {
  return currentIndex >= totalQuestions - Math.ceil(totalQuestions * 0.25);
}