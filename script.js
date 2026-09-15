const totalQuestions = 30;
const additionPairs = [
  [25, 12], [34, 21], [47, 32], [56, 13], [68, 21], [39, 45],
  [72, 16], [84, 15], [27, 61], [43, 28], [55, 24], [76, 13],
  [31, 48], [62, 27], [18, 73], [49, 36]
];
const subtractionPairs = [
  [8, 3], [12, 5], [15, 7], [20, 6], [18, 9], [14, 4],
  [10, 2], [17, 8], [13, 6], [19, 10], [16, 7], [11, 3],
  [9, 4], [20, 11], [15, 5], [18, 6]
];
const battleColors = ['#fef08a', '#fbbf24', '#fb7185', '#a78bfa', '#34d399', '#60a5fa', '#fca5a5'];

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

let questions = [];
let gameActive = true;
let audioContext = null;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createQuestion(type) {
  const [first, second] = randomItem(type === 'Addition' ? additionPairs : subtractionPairs);
  const answer = type === 'Addition' ? first + second : first - second;
  const wrongAnswers = new Set();

  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * 9) + 1;
    const wrongAnswer = answer + (Math.random() > 0.5 ? offset : -offset);
    const isValidSubtractionChoice = type === 'Addition' || (wrongAnswer >= 1 && wrongAnswer <= 20);
    if (isValidSubtractionChoice && wrongAnswer !== answer) wrongAnswers.add(wrongAnswer);
  }

  return {
    type,
    prompt: `${first} ${type === 'Addition' ? '+' : '-'} ${second} = ?`,
    options: shuffle([answer, ...wrongAnswers]),
    answer
  };
}

function createQuestionDeck() {
  const types = Array.from({ length: totalQuestions }, (_, index) => (
    index % 2 === 0 ? 'Addition' : 'Subtraction'
  ));
  return shuffle(types).map(createQuestion);
}

function initGame() {
  questions = createQuestionDeck();
  gameActive = true;
  finalOverlayEl.classList.add('hidden');
  statusTextEl.textContent = 'Ready, Math Hero!';
  statusTextEl.className = 'status-text';
  updateHeroAndMonster(0);
  showQuestion(0);
}

function showQuestion(index) {
  const question = questions[index];
  questionNumberEl.textContent = index + 1;
  questionTypeEl.textContent = `${question.type} Challenge`;
  questionTextEl.textContent = question.prompt;
  answerButtonsEl.innerHTML = '';

  question.options.forEach((option) => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.type = 'button';
    button.textContent = option;
    button.setAttribute('aria-label', `Answer ${option}`);
    button.addEventListener('click', () => handleAnswer(option, question.answer, index + 1));
    answerButtonsEl.appendChild(button);
  });
}

function handleAnswer(selectedValue, correctAnswer, questionNumber) {
  if (!gameActive) return;

  const buttons = [...answerButtonsEl.querySelectorAll('.answer-btn')];
  buttons.forEach((button) => button.classList.add('disabled'));

  if (selectedValue === correctAnswer) {
    showStatus('CORRECT! Great thinking!', 'correct');
    playCorrectSound();
    createBurstBurst();
    updateHeroAndMonster(questionNumber);

    if (questionNumber === totalQuestions) {
      gameActive = false;
      setTimeout(runFinalVictory, 700);
      return;
    }

    setTimeout(() => {
      statusTextEl.textContent = 'Nice work! Next challenge!';
      statusTextEl.className = 'status-text';
      showQuestion(questionNumber);
    }, 900);
    return;
  }

  showStatus('Almost! Try another answer!', 'wrong');
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
  for (let index = 0; index < 30; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.background = randomItem(battleColors);
    particle.style.left = `${50 + (Math.random() * 26 - 13)}%`;
    particle.style.top = `${52 + (Math.random() * 18 - 9)}%`;
    particle.style.setProperty('--dx', `${(Math.random() * 180 - 90).toFixed(0)}px`);
    particle.style.setProperty('--dy', `${(Math.random() * 190 - 140).toFixed(0)}px`);
    particlesEl.appendChild(particle);
    setTimeout(() => particle.remove(), 900);
  }
}

function runFinalVictory() {
  statusTextEl.textContent = 'ALL 30 COMPLETE!';
  statusTextEl.className = 'status-text correct';
  playVictorySound();
  heroEl.style.setProperty('--hero-scale', '1.7');
  monsterEl.style.setProperty('--monster-scale', '0.3');
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
    if (AudioCtor) audioContext = new AudioCtor();
  }
  if (audioContext && audioContext.state === 'suspended') audioContext.resume();
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
  playTone(659.25, 0.14, 'triangle', 0.06, 0.12);
  playTone(783.99, 0.22, 'triangle', 0.07, 0.24);
}

function playWrongSound() {
  ensureAudioContext();
  playTone(220, 0.12, 'square', 0.04);
  playTone(180, 0.16, 'square', 0.03, 0.12);
}

function playVictorySound() {
  ensureAudioContext();
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    playTone(frequency, 0.22, 'triangle', 0.08, index * 0.14);
  });
  playTone(1318.51, 0.28, 'triangle', 0.08, 0.68);
}

playAgainBtn.addEventListener('click', initGame);
window.addEventListener('pointerdown', ensureAudioContext, { once: true });

initGame();
