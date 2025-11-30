// --- IMPORTS ---
import { VALID_WORDS } from './words.js';
import { DAILY_PUZZLES } from './puzzles.js';


// --- DAILY PUZZLE SELECTION ---
function getDayIndex() {
  const start = new Date("2025-01-01");
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  // return diff % DAILY_PUZZLES.length;
  return 0; // Override for testing
}

const puzzle = DAILY_PUZZLES[getDayIndex()];
const startWord = puzzle.start;
const endWord = puzzle.end;


// --- DOM ELEMENTS ---
const startContainer = document.getElementById("start-word");
const endContainer = document.getElementById("end-word");

startContainer.appendChild(renderTiles(startWord));
endContainer.appendChild(renderTiles(endWord));

document.getElementById("puzzle-info").textContent = `Daily Bridge #${getDayIndex()}`;

const ladderDiv = document.getElementById("ladder");
const input = document.getElementById("guess-input");
input.focus();  // <-- add this line
const message = document.getElementById("message");


// --- GAME STATE ---
let ladder = [startWord];
let gameOver = false;


// --- UTILS ---
function showMessage(msg, time = 2000) {
  message.textContent = msg;

  // Shake the input box
  input.classList.add("shake");
  setTimeout(() => input.classList.remove("shake"), 350);

  if (time > 0) {
    setTimeout(() => (message.textContent = ""), time);
  }
}


function isValidWord(word) {
  return VALID_WORDS.includes(word);
}


// --- ✔ FIXED exact-one-letter-change logic ---
function diffOneLetter(prev, curr) {
  if (prev.length !== 5 || curr.length !== 5) return false;

  const countPrev = {};
  const countCurr = {};

  for (let c of prev) countPrev[c] = (countPrev[c] || 0) + 1;
  for (let c of curr) countCurr[c] = (countCurr[c] || 0) + 1;

  let diff = 0;

  for (let c in countPrev) {
    const prevCount = countPrev[c];
    const currCount = countCurr[c] || 0;
    diff += Math.abs(prevCount - currCount);
  }

  for (let c in countCurr) {
    if (!countPrev[c]) diff += countCurr[c];
  }

  return diff === 2; // exactly 1 removed + 1 added
}


// --- DOM BUILD ---
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

function addToLadder(word) {
  ladder.push(word);

  // Create the row container
  const row = document.createElement("div");
  row.className = "ladder-word";

  // Create 5 tiles, one for each letter
  for (let char of word.toUpperCase()) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = char;
    row.appendChild(tile);
  }

  ladderDiv.appendChild(row);
}

// --- ✔ NEW: Unified win logic ---
function handleWin() {
  const steps = ladder.length - 1;
  showMessage(`Bridge complete in ${steps} steps! 🎉`, 0);

  // Confetti burst
  confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
  });

  // Lock game
  gameOver = true;
  input.disabled = true;
  document.getElementById("submit-btn").disabled = true;

  // Reveal banner
  const banner = document.getElementById("next-banner");
  banner.classList.remove("hidden");
  setTimeout(() => banner.classList.add("show"), 50);
}


// --- MAIN ACTION ---
document.getElementById("submit-btn").onclick = () => {
  
  if (gameOver) return;

  const guess = input.value.toLowerCase();
  input.value = "";

  input.focus();  // <-- add this line

  if (guess.length !== 5) {
    showMessage("Must be 5 letters!");
    return;
  }

  if (!isValidWord(guess)) {
    showMessage("Not in dictionary!");
    return;
  }

  const prev = ladder[ladder.length - 1];
  if (!diffOneLetter(prev, guess)) {
    showMessage("Must change exactly ONE letter!");
    return;
  }

  // Add user's valid move
  addToLadder(guess);

  // ⭐ NEW: Auto-complete if the guess is one letter away from the end word
  if (diffOneLetter(guess, endWord)) {
    // Do NOT add endWord to ladder — it's already shown in UI
    handleWin();
    return;
  }

  // OLD: Manual completion (kept for safety)
  if (guess === endWord) {
    handleWin();
    return;
  }
};

// --- ENTER KEY SUPPORT ---
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("submit-btn").click();
  }
});

// --- UNDO LAST STEP (Backspace when input is empty) ---
document.addEventListener("keydown", (e) => {
  if (gameOver) return;  
  if (e.key !== "Backspace") return;  
  if (input.value.length !== 0) return;  // only undo when input is empty
  if (ladder.length <= 1) return;  // don't remove start word

  // Remove last ladder entry
  ladder.pop();

  // Remove last DOM element
  ladderDiv.removeChild(ladderDiv.lastElementChild);

  showMessage("Step undone");
});
