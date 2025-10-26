let score = 0;
let mode = "";
let currentAnswer = 0;
// New globals for the multiplication options
let selectedTables = [];   // which times tables (right factor), e.g., [2, 3, 5]
let factorMin = 0;         // other factor lower bound
let factorMax = 12;        // other factor upper bound

// Session stats
let correctCount = 0;
let wrongCount = 0;
let questionCount = 0;
const MAX_QUESTIONS = 20;

// --- Local Save Helpers ---
// Load previously saved best stats or create defaults
function loadBestStats() {
  const raw = localStorage.getItem("mathBest");
  if (!raw) {
    return {
      multiply: { right: 0, wrong: 0 },
      rounding: { right: 0, wrong: 0 },
      addsub: { right: 0, wrong: 0 }
    };
  }
  return JSON.parse(raw);
}

// Save updated best stats back to localStorage
function saveBestStats(bestStats) {
  localStorage.setItem("mathBest", JSON.stringify(bestStats));
}

// Update the "Best Score" line on the menu
function updateBestStatsDisplay() {
  const bestStats = loadBestStats();

  let bestMode = "multiply";
  let bestRight = bestStats.multiply.right;
  let bestWrong = bestStats.multiply.wrong;

  if (bestStats.rounding.right > bestRight) {
    bestMode = "rounding";
    bestRight = bestStats.rounding.right;
    bestWrong = bestStats.rounding.wrong;
  }

  if (bestStats.addsub.right > bestRight) {
    bestMode = "addsub";
    bestRight = bestStats.addsub.right;
    bestWrong = bestStats.addsub.wrong;
  }

  const modeNames = {
    multiply: "Multiplication",
    rounding: "Rounding",
    addsub: "Add & Subtract"
  };

  const bestText = (bestRight === 0 && bestWrong === 0)
    ? "Best Score: --"
    : "Best in " + modeNames[bestMode] + ": " +
      bestRight + " right / " + bestWrong + " wrong";

  const bestStatsEl = document.getElementById("bestStats");
  if (bestStatsEl) {
    bestStatsEl.innerText = bestText;
  }
}

function updateBestStatsDisplay() {
  const bestStats = loadBestStats();

  // Pick which mode to brag about, or just show the best across all
  // We'll show the best "right" across all modes
  let bestMode = "multiply";
  let bestRight = bestStats.multiply.right;
  let bestWrong = bestStats.multiply.wrong;

  if (bestStats.rounding.right > bestRight) {
    bestMode = "rounding";
    bestRight = bestStats.rounding.right;
    bestWrong = bestStats.rounding.wrong;
  }

  if (bestStats.addsub.right > bestRight) {
    bestMode = "addsub";
    bestRight = bestStats.addsub.right;
    bestWrong = bestStats.addsub.wrong;
  }

  const modeNames = {
    multiply: "Multiplication",
    rounding: "Rounding",
    addsub: "Add & Subtract"
  };

  const bestText = (bestRight === 0 && bestWrong === 0)
    ? "Best Score: --"
    : "Best in " + modeNames[bestMode] + ": " +
      bestRight + " right / " + bestWrong + " wrong";

  const bestStatsEl = document.getElementById("bestStats");
  if (bestStatsEl) {
    bestStatsEl.innerText = bestText;
  }
}

function startGame(selectedMode) {
  // reset shared UI
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  questionCount = 0;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("progressText").innerText = "Question: 0 / " + MAX_QUESTIONS;
  document.getElementById("accuracyText").innerText = "Right: 0 | Wrong: 0";

  document.getElementById("feedback").innerText = "";
  const cele = document.getElementById("celebration");
  if (cele) cele.classList.add("hidden");

  mode = selectedMode;

  // If multiplication, show the options panel first
  if (mode === "multiply") {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("multOptions").classList.remove("hidden");
    return; // we'll actually begin after options via beginMultiplication()
  }

  // Otherwise go straight into the game
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameArea").classList.remove("hidden");
  nextQuestion();
}


// --- Multiplication selection helpers ---
function selectAllTables(select) {
  const boxes = document.querySelectorAll('#tablesGrid input[type="checkbox"]');
  boxes.forEach(cb => cb.checked = !!select);
}

function readOptions() {
  // collect selected right-hand tables (0–12)
  const boxes = document.querySelectorAll('#tablesGrid input[type="checkbox"]');
  selectedTables = [];
  boxes.forEach(cb => {
    if (cb.checked) selectedTables.push(parseInt(cb.value, 10));
  });

  // read other factor range
  const minEl = document.getElementById('factorMin');
  const maxEl = document.getElementById('factorMax');
  factorMin = Math.max(0, Math.min(12, parseInt(minEl.value || '0', 10)));
  factorMax = Math.max(0, Math.min(12, parseInt(maxEl.value || '12', 10)));
  if (factorMin > factorMax) {
    // swap to keep valid
    const tmp = factorMin;
    factorMin = factorMax;
    factorMax = tmp;
  }
}

function beginMultiplication() {
  readOptions();
  if (selectedTables.length === 0) {
    alert("Please select at least one times table (e.g., 2s or 5s).");
    return;
  }

  // reset visible counters at the moment they start
  document.getElementById("progressText").innerText = "Question: 0 / " + MAX_QUESTIONS;
  document.getElementById("accuracyText").innerText = "Right: 0 | Wrong: 0";

  document.getElementById("multOptions").classList.add("hidden");
  document.getElementById("gameArea").classList.remove("hidden");
  nextQuestion();
}


function nextQuestion() {
  document.getElementById("feedback").innerText = "";

  // Are we done with the session?
  if (questionCount >= MAX_QUESTIONS) {
    endSession();
    return;
  }

  // We're asking a new question now:
  questionCount++;
  document.getElementById("progressText").innerText =
    "Question: " + questionCount + " / " + MAX_QUESTIONS;

  let question = "";
  let answer = 0;

  if (mode === "multiply") {
    // (your updated multiplication logic)
    const a = Math.floor(Math.random() * (factorMax - factorMin + 1)) + factorMin;
    const b = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    question = `${a} × ${b}`;
    answer = a * b;

  } else if (mode === "rounding") {
    let num = Math.floor(Math.random() * 900) + 100;
    question = `Round ${num} to the nearest 10`;
    answer = Math.round(num / 10) * 10;

  } else if (mode === "addsub") {
    let a = Math.floor(Math.random() * 900) + 100;
    let b = Math.floor(Math.random() * 900) + 100;
    if (Math.random() > 0.5) {
      question = `${a} + ${b}`;
      answer = a + b;
    } else {
      question = `${a} - ${b}`;
      answer = a - b;
    }
  }

  currentAnswer = answer;
  document.getElementById("question").innerText = question;

  // Generate multiple-choice answers
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  const correctPos = Math.floor(Math.random() * 4);
  for (let i = 0; i < 4; i++) {
    let choice = (i === correctPos) ? answer : answer + Math.floor(Math.random() * 10) - 5;
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.onclick = () => checkAnswer(choice);
    answersDiv.appendChild(btn);
  }
}


function checkAnswer(choice) {
  let feedback = document.getElementById("feedback");
  feedback.innerText = "";

if (choice === currentAnswer) {
  feedback.innerText = "✅ Correct! Great job!";
  score++;
  correctCount++;

  const ok = document.getElementById("correctSound");
  if (ok) ok.play().catch(()=>{});

  document.getElementById("score").innerText = "Score: " + score;

  // Update right/wrong text
  document.getElementById("accuracyText").innerText =
    "Right: " + correctCount + " | Wrong: " + wrongCount;

  // Celebration popup every 5
  if (score > 0 && score % 5 === 0) {
    document.getElementById("celebrationText").innerText =
      "You got " + score + " correct answers!";
    document.getElementById("celebration").classList.remove("hidden");
  }

  // 👇 NEW: automatically go to next question after 1.5 seconds
  feedback.style.transition = "opacity 0.5s";
	feedback.style.opacity = "1";
	setTimeout(() => {
  feedback.style.opacity = "0";
}, 1000);

  setTimeout(() => {
    nextQuestion();
  }, 1500);
}
 else {
    feedback.innerText = "❌ Oops! Try again!";
    wrongCount++;

    const nope = document.getElementById("incorrectSound");
    if (nope) nope.play().catch(()=>{});
  }

  // Update accuracy text
  document.getElementById("accuracyText").innerText =
    "Right: " + correctCount + " | Wrong: " + wrongCount;

  // Celebration every 5 points (same logic as before)
  if (score > 0 && score % 5 === 0) {
    document.getElementById("celebrationText").innerText =
      "You got " + score + " correct answers!";
    document.getElementById("celebration").classList.remove("hidden");
  }
}

function endSession() {
  // 1. Show summary of THIS session
  const summary =
    "You got " + correctCount + " right and " + wrongCount + " wrong.";
  document.getElementById("sessionSummaryText").innerText = summary;

  // 2. Load current best from localStorage
  const bestStats = loadBestStats();

  // 3. If the current run is better, update it for this mode
  // "Better" means: more correct in this mode
  if (!bestStats[mode] || correctCount > bestStats[mode].right) {
    bestStats[mode] = {
      right: correctCount,
      wrong: wrongCount
    };
    saveBestStats(bestStats);
  }

  // 4. Hide game screen and show summary popup
  document.getElementById("gameArea").classList.add("hidden");
  document.getElementById("sessionEnd").classList.remove("hidden");
}

function playAgain() {
  // Hide the session summary popup
  document.getElementById("sessionEnd").classList.add("hidden");

  // Reset round stats for a new session
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  questionCount = 0;

  // Update UI values at the top of the game screen
  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("progressText").innerText =
    "Question: 0 / " + MAX_QUESTIONS;
  document.getElementById("accuracyText").innerText =
    "Right: 0 | Wrong: 0";

  // Clear feedback
  document.getElementById("feedback").innerText = "";

  // Show the game area again
  document.getElementById("gameArea").classList.remove("hidden");

  // Start a new round in the SAME mode and SAME settings
  nextQuestion();
}

function goBack() {
  // Hide game area
  document.getElementById("gameArea").classList.add("hidden");

  // Hide overlays
  const cele = document.getElementById("celebration");
  if (cele) cele.classList.add("hidden");
  const end = document.getElementById("sessionEnd");
  if (end) end.classList.add("hidden");

  // Show main menu
  document.getElementById("menu").classList.remove("hidden");
  
  // 🔄 NEW: refresh the "Best Score" line on the menu
  updateBestStatsDisplay();


  // Reset counters
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  questionCount = 0;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("progressText").innerText = "Question: 0 / " + MAX_QUESTIONS;
  document.getElementById("accuracyText").innerText = "Right: 0 | Wrong: 0";

  // Clear question UI
  document.getElementById("feedback").innerText = "";
  document.getElementById("question").innerText = "";
  document.getElementById("answers").innerHTML = "";
}


function closeCelebration() {
  document.getElementById("celebration").classList.add("hidden");
}

// When the page first loads, show best stats in menu if they exist
updateBestStatsDisplay();

