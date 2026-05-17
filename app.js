let allQuestions = [];
let deck = [];
let currentIndex = -1;
let correct = 0;
let attempts = 0;
let answeredCurrent = false;

const els = {
  startBtn: document.getElementById('startBtn'),
  shuffleBtn: document.getElementById('shuffleBtn'),
  roundSelect: document.getElementById('roundSelect'),
  roundLabel: document.getElementById('roundLabel'),
  progressLabel: document.getElementById('progressLabel'),
  questionText: document.getElementById('questionText'),
  answerForm: document.getElementById('answerForm'),
  answerInput: document.getElementById('answerInput'),
  result: document.getElementById('result'),
  showAnswerBtn: document.getElementById('showAnswerBtn'),
  nextBtn: document.getElementById('nextBtn'),
  scoreLabel: document.getElementById('scoreLabel'),
  attemptLabel: document.getElementById('attemptLabel'),
  accuracyLabel: document.getElementById('accuracyLabel'),
};

fetch('questions.json')
  .then(r => r.json())
  .then(data => {
    allQuestions = data;
    populateRounds();
    resetDeck();
  })
  .catch(() => {
    els.questionText.textContent = 'Could not load questions.json. Open this folder with a local server, not directly as a file.';
  });

function populateRounds() {
  const rounds = [...new Set(allQuestions.map(q => q.round))].sort();
  for (const round of rounds) {
    const option = document.createElement('option');
    option.value = round;
    option.textContent = round;
    els.roundSelect.appendChild(option);
  }
}

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/\[\[[^\]]+\]\]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|a|an)\b/g, ' ')
    .trim();
}

function isCorrect(userAnswer, question) {
  const guess = normalize(userAnswer);
  if (!guess) return false;
  const accepted = question.acceptableAnswers && question.acceptableAnswers.length
    ? question.acceptableAnswers
    : [question.answer.split('(')[0]];
  return accepted.some(ans => {
    const target = normalize(ans);
    return target && (guess === target || guess.includes(target) || target.includes(guess));
  });
}

function resetDeck() {
  const selectedRound = els.roundSelect.value;
  deck = selectedRound === 'all'
    ? [...allQuestions]
    : allQuestions.filter(q => q.round === selectedRound);
  shuffle(deck);
  currentIndex = -1;
  correct = 0;
  attempts = 0;
  answeredCurrent = false;
  updateStats();
  els.progressLabel.textContent = `0 / ${deck.length}`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function nextQuestion() {
  if (!deck.length) return;
  currentIndex = (currentIndex + 1) % deck.length;
  answeredCurrent = false;
  const q = deck[currentIndex];
  els.roundLabel.textContent = `${q.round} • ${q.section || 'Questions'} #${q.number}`;
  els.progressLabel.textContent = `${currentIndex + 1} / ${deck.length}`;
  els.questionText.textContent = q.question;
  els.answerInput.value = '';
  els.result.className = 'result hidden';
  els.result.textContent = '';
  els.answerInput.focus();
}

function updateStats() {
  els.scoreLabel.textContent = correct;
  els.attemptLabel.textContent = attempts;
  els.accuracyLabel.textContent = attempts ? `${Math.round((correct / attempts) * 100)}%` : '0%';
}

els.startBtn.addEventListener('click', () => { resetDeck(); nextQuestion(); });
els.shuffleBtn.addEventListener('click', () => { resetDeck(); nextQuestion(); });
els.roundSelect.addEventListener('change', resetDeck);
els.nextBtn.addEventListener('click', nextQuestion);

els.showAnswerBtn.addEventListener('click', () => {
  const q = deck[currentIndex];
  if (!q) return;
  els.result.className = 'result';
  els.result.innerHTML = `<strong>Answer:</strong> ${q.answer}`;
});

els.answerForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = deck[currentIndex];
  if (!q) return;
  const ok = isCorrect(els.answerInput.value, q);
  if (!answeredCurrent) {
    attempts += 1;
    if (ok) correct += 1;
    answeredCurrent = true;
    updateStats();
  }
  els.result.className = `result ${ok ? 'correct' : 'incorrect'}`;
  els.result.innerHTML = ok
    ? `<strong>Correct!</strong><br>Accepted: ${q.answer}`
    : `<strong>Not quite.</strong><br>Correct answer: ${q.answer}`;
});
