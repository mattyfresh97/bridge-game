// --- IMPORTS ---
import { VALID_WORDS } from './words.js';
import { DAILY_PUZZLES } from './puzzles.js';


// --- DAILY PUZZLE SELECTION ---
function getDayIndex() {
  const start = new Date("2025-01-01");
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return 0; // override for testing
}

const puzzle = DAILY_PUZZLES[getDayIndex()];
const startWord = puzzle.start;
const endWord = puzzle.end;


// --- DOM ELEMENTS ---
const ladderDiv = document.getElementById("ladder");
const input = document.getElementById("guess-input");
const message = document.getElementById("message");

// Render start/end words as tiles
document.getElementById("start-word").appendChild(renderTiles(startWord));
document.getElementById("end-word").appendChild(renderTiles(endWord));
document.getElementById("puzzle-info").textContent = `Daily Bridge #${getDayIndex()}`;

input.focus();


// --- GAME STATE ---
let ladder = [startWord];
let gameOver = false;


// --- UTILS ---
function showMessage(msg, time = 2000) {
  message.textContent = msg;

  // shake animation
  input.classList.add("shake");
  setTimeout(() => input.classList.remove("shake"), 350);

  if (time > 0) {
    setTimeout(() => (message.textContent = ""), time);
  }
}

function isValidWord(word) {
  return VALID_WORDS.includes(word);
}


// --- TILE RENDERING ---
function renderTiles(word) {
  const container = document.createElement("div");
  container.className = "tile-row";

  for (let char of word.toUpperCase()) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = char;
    container.appendChild(tile);
  }

  return container;
}


// --- ADD LADDER ROW ---
function addToLadder(word) {
  ladder.push(word);

  const row = document.createElement("div");
  row.className = "ladder-word";

  for (let char of word.toUpperCase()) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = char;
    row.appendChild(tile);
  }

  ladderDiv.appendChild(row);
}


// ------------------------------------------------------------
// NEW: UNIVERSAL ONE-MOVE-AWAY CHECK (add/remove/substitute)
// ------------------------------------------------------------
function isOneMoveAway(a, b) {
  // Same length → substitute rule
  if (a.length === b.length) {
    const countA = {};
    const countB = {};

    for (let c of a) countA[c] = (countA[c] || 0) + 1;
    for (let c of b) countB[c] = (countB[c] || 0) + 1;

    let diff = 0;
    for (let c in countA) diff += Math.abs((countB[c] || 0) - countA[c]);
    for (let c in countB) if (!countA[c]) diff += countB[c];

    return diff === 2;  // one removed + one added
  }

  // Length differs by 1 → add/remove rule
  if (Math.abs(a.length - b.length) === 1) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    const countLong = {};
    const countShort = {};

    for (let c of longer) countLong[c] = (countLong[c] || 0) + 1;
    for (let c of shorter) countShort[c] = (countShort[c] || 0) + 1;

    let diff = 0;
    for (let c in countLong) diff += Math.abs((countShort[c] || 0) - countLong[c]);

    return diff === 1; // exactly one extra letter
  }

  return false;
}


// --- WIN HANDLER ---
function handleWin() {
  const steps = ladder.length - 1;
  showMessage(`Bridge complete in ${steps} steps! 🎉`, 0);

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });

  gameOver = true;
  input.disabled = true;

  const banner = document.getElementById("next-banner");
  banner.classList.remove("hidden");
  setTimeout(() => banner.classList.add("show"), 50);
}


// --- MAIN SUBMIT LOGIC ---
function submitGuess() {
  if (gameOver) return;

  const guess = input.value.toLowerCase();
  input.value = "";
  input.focus();

  if (!guess.match(/^[a-z]+$/)) {
    showMessage("Letters only!");
    return;
  }

  if (guess.length < 4 || guess.length > 6) {
    showMessage("Word must be 4–6 letters!");
    return;
  }

  if (!isValidWord(guess)) {
    showMessage("Not in dictionary!");
    return;
  }

  const prev = ladder[ladder.length - 1];

  // Must be a valid one-step transformation
  if (!isOneMoveAway(prev, guess)) {
    showMessage("Must change exactly one letter!");
    return;
  }

  addToLadder(guess);

  // WIN CHECK — Automatically win WITHOUT typing final word
  if (isOneMoveAway(guess, endWord) || guess === endWord) {
    handleWin();
    return;
  }
}


// --- ENTER KEY (desktop) ---
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitGuess();
});


// --- UNDO on Backspace (desktop) ---
document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.key !== "Backspace") return;
  if (input.value.length !== 0) return;
  if (ladder.length <= 1) return;

  ladder.pop();
  ladderDiv.removeChild(ladderDiv.lastElementChild);
  showMessage("Step undone");
});

// // --- HELP MODAL OPEN ---
// const helpBtn = document.getElementById("help-btn");
// if (helpBtn) {
//   helpBtn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     const modal = document.getElementById("help-modal");
//     if (modal) modal.classList.add("open");
//   });
// }

// // --- HELP MODAL CLOSE ---
// const closeHelp = document.getElementById("close-help");
// if (closeHelp) {
//   closeHelp.addEventListener("click", () => {
//     const modal = document.getElementById("help-modal");
//     if (modal) modal.classList.remove("open");
//     input.focus(); // optional - refocus input for smooth gameplay
//   });
// }


// --- HELP MODAL OPEN/CLOSE (SAFE VERSION) ---
document.addEventListener("DOMContentLoaded", () => {
  const helpBtn = document.getElementById("help-btn");
  const helpModal = document.getElementById("help-modal");
  const closeHelp = document.getElementById("close-help");

  if (!helpBtn || !helpModal || !closeHelp) {
    console.warn("Help modal elements not found.");
    return;
  }

  helpBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    helpModal.classList.remove("hidden");
  });

  closeHelp.addEventListener("click", () => {
    helpModal.classList.add("hidden");
  });

  helpModal.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      helpModal.classList.add("hidden");
    }
  });
});
