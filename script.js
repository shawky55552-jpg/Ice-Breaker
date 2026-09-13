const totalQuestions = 25;
const questions = [
  { type: 'Addition', prompt: '1 + 2 = ?', options: [3, 5, 4, 2], answer: 3 },
  { type: 'Addition', prompt: '7 + 4 = ?', options: [11, 10, 12, 9], answer: 11 },
  { type: 'Addition', prompt: '9 + 6 = ?', options: [15, 17, 14, 13], answer: 15 },
  { type: 'Addition', prompt: '5 + 8 = ?', options: [14, 12, 13, 11], answer: 13 },
  { type: 'Addition', prompt: '3 + 12 = ?', options: [14, 15, 16, 13], answer: 15 },
  { type: 'Addition', prompt: '10 + 7 = ?', options: [18, 16, 17, 15], answer: 17 },
  { type: 'Addition', prompt: '11 + 5 = ?', options: [18, 16, 15, 14], answer: 16 },
  { type: 'Addition', prompt: '14 + 3 = ?', options: [17, 16, 18, 15], answer: 17 },
  { type: 'Addition', prompt: '6 + 9 = ?', options: [15, 16, 17, 14], answer: 15 },
  { type: 'Addition', prompt: '8 + 8 = ?', options: [16, 15, 18, 14], answer: 16 },
  { type: 'Addition', prompt: '13 + 4 = ?', options: [17, 16, 18, 15], answer: 17 },
  { type: 'Addition', prompt: '2 + 15 = ?', options: [17, 16, 15, 18], answer: 17 },
  { type: 'Addition', prompt: '12 + 6 = ?', options: [17, 18, 19, 16], answer: 18 },
  { type: 'Addition', prompt: '9 + 5 = ?', options: [14, 15, 16, 13], answer: 14 },
  { type: 'Addition', prompt: '7 + 11 = ?', options: [18, 16, 17, 19], answer: 18 },
  { type: 'Addition', prompt: '4 + 10 = ?', options: [15, 14, 16, 13], answer: 14 },
  { type: 'Addition', prompt: '15 + 2 = ?', options: [17, 18, 16, 15], answer: 17 },
  { type: 'Comparison', prompt: 'Which number is greater than 24?', options: [18, 30, 24, 15], answer: 30 },
  { type: 'Comparison', prompt: 'Which number is less than 41?', options: [43, 48, 39, 50], answer: 39 },
  { type: 'Comparison', prompt: 'Which number is greater than 17?', options: [16, 10, 21, 14], answer: 21 },
  { type: 'Comparison', prompt: 'Which number is less than 33?', options: [34, 36, 27, 40], answer: 27 },
  { type: 'Comparison', prompt: 'Which number is greater than 29?', options: [27, 31, 29, 18], answer: 31 },
  { type: 'Comparison', prompt: 'Which number is less than 45?', options: [47, 50, 44, 46], answer: 44 },
  { type: 'Comparison', prompt: 'Which number is greater than 8?', options: [7, 6, 9, 5], answer: 9 },
  { type: 'Counting', prompt: 'Count from 1 to 50! What comes after 47?', options: [48, 39, 51, 46], answer: 48 },
  { type: 'Counting', prompt: 'Count by tens: 10, 20, 30, 40, 50. What comes next?', options: [60, 50, 30, 20], answer: 60 }
];

const questionNumberEl = document.getElementById('questionNumber');
const questionTypeEl = document.getElementById('questionType');
const questionTextEl = document.getElementById('questionText');
const answerButtonsEl = document.getElementById('answerButtons');
const powerFillEl = document.getElementById('powerFill');
const statusTextEl = document.getElementById('statusText');
const particlesEl = document.getElementById('particles');
const heroEl = document.getElementById('hero');
const monsterEl = document.getElementById('monster');
const finalOverlayEl = document.getElementById('finalOverlay');
const playAgainBtn = document.getElementById('playAgainBtn');

const battleColors = ['#fef08a', '#fbbf24', '#fb7185', '#a78bfa', '#34d399', '#60a5fa', '#fca5a5'];

let gameActive = true;
let audioContext = null;

function initGame() {
  gameActive = true;
  finalOverlayEl.classList.add('hidden');
  updateHeroAndMonster(0);
  showQuestion(0);
}

function resetGame() {
  gameActive = true;
  statusTextEl.textContent = 'Ready, Math Hero!';
  statusTextEl.className = 'status-text';
  finalOverlayEl.classList.add('hidden');
  updateHeroAndMonster(0);
  powerFillEl.style.width = '0%';
  showQuestion(0);
}

function showQuestion(index) {
  const question = questions[index];
  const questionNumber = index + 1;

  questionNumberEl.textContent = questionNumber;
  questionTypeEl.textContent = `${question.type} Challenge`;
  questionTextEl.textContent = question.prompt;
  answerButtonsEl.innerHTML = '';

  question.options.forEach((option) => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => handleAnswer(option, question.answer, questionNumber));
    answerButtonsEl.appendChild(button);
  });
}

function handleAnswer(selectedValue, correctAnswer, questionNumber) {
  if (!gameActive) return;

  const buttons = [...answerButtonsEl.querySelectorAll('.answer-btn')];
  buttons.forEach((button) => button.classList.add('disabled'));

  if (selectedValue === correctAnswer) {
    showStatus('CORRECT!', 'correct');
    playCorrectSound();
    createBurstBurst();
    updateHeroAndMonster(questionNumber);

    if (questionNumber === totalQuestions) {
      gameActive = false;
      setTimeout(() => runFinalVictory(), 700);
      return;
    }

    setTimeout(() => {
      statusTextEl.textContent = 'Nice work! Next challenge!';
      statusTextEl.className = 'status-text';
      showQuestion(questionNumber);
      powerFillEl.style.width = `${(questionNumber / totalQuestions) * 100}%`;
    }, 900);

    return;
  }

  showStatus('TRY AGAIN!', 'wrong');
  playWrongSound();
  buttons.forEach((button) => button.classList.remove('disabled'));
  questionTextEl.classList.remove('shake');
  void questionTextEl.offsetWidth;
  questionTextEl.classList.add('shake');
}

function showStatus(message, type) {
  statusTextEl.textContent = message;
  statusTextEl.className = `status-text ${type}`;
}

function updateHeroAndMonster(progress) {
  const heroScale = 1 + progress * 0.024;
  const monsterScale = Math.max(0.42, 1 - progress * 0.028);

  heroEl.style.setProperty('--hero-scale', heroScale.toFixed(3));
  monsterEl.style.setProperty('--monster-scale', monsterScale.toFixed(3));

  heroEl.classList.remove('invigorated');
  void heroEl.offsetWidth;
  heroEl.classList.add('invigorated');

  monsterEl.classList.add('angry');
  powerFillEl.style.width = `${(progress / totalQuestions) * 100}%`;
}

function createBurstBurst() {
  for (let i = 0; i < 24; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    const color = battleColors[Math.floor(Math.random() * battleColors.length)];
    particle.style.background = color;
    particle.style.left = `${50 + (Math.random() * 26 - 13)}%`;
    particle.style.top = `${52 + (Math.random() * 18 - 9)}%`;
    particle.style.setProperty('--dx', `${(Math.random() * 150 - 75).toFixed(0)}px`);
    particle.style.setProperty('--dy', `${(Math.random() * 180 - 130).toFixed(0)}px`);
    particlesEl.appendChild(particle);
    setTimeout(() => particle.remove(), 900);
  }
}

function runFinalVictory() {
  statusTextEl.textContent = 'MONSTER POP!';
  statusTextEl.className = 'status-text correct';
  playVictorySound();

  heroEl.style.setProperty('--hero-scale', '1.7');
  monsterEl.style.setProperty('--monster-scale', '0.3');
  monsterEl.classList.add('angry');

  setTimeout(() => {
    createBurstBurst();
    createBurstBurst();
    createBurstBurst();
  }, 150);

  finalOverlayEl.classList.remove('hidden');
  questionTypeEl.textContent = 'Victory!';
  questionTextEl.textContent = 'YOU DID IT! YOU ARE A MATH HERO!';
  answerButtonsEl.innerHTML = '';
}

function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) {
      audioContext = new AudioCtor();
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type = 'sine', volume = 0.04, delay = 0) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(audioContext.currentTime + delay);
  oscillator.stop(audioContext.currentTime + delay + duration);
}

function playCorrectSound() {
  ensureAudioContext();
  playTone(523.25, 0.14, 'triangle', 0.06);
  setTimeout(() => playTone(659.25, 0.14, 'triangle', 0.06), 120);
  setTimeout(() => playTone(783.99, 0.22, 'triangle', 0.07), 240);
}

function playWrongSound() {
  ensureAudioContext();
  playTone(220, 0.12, 'square', 0.04);
  setTimeout(() => playTone(180, 0.16, 'square', 0.03), 120);
}

function playVictorySound() {
  ensureAudioContext();
  const melody = [523.25, 659.25, 783.99, 1046.5];
  melody.forEach((freq, index) => {
    setTimeout(() => playTone(freq, 0.22, 'triangle', 0.08), index * 140);
  });
  setTimeout(() => {
    playTone(1046.5, 0.2, 'triangle', 0.08);
    setTimeout(() => playTone(1318.51, 0.28, 'triangle', 0.08), 120);
  }, 560);
}

playAgainBtn.addEventListener('click', resetGame);
window.addEventListener('pointerdown', ensureAudioContext, { once: true });

initGame();
