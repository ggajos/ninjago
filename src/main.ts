/**
 * Ninjago Math Game - Main Entry Point
 *
 * Inicjalizacja gry i obsługa interfejsu użytkownika.
 */

import "./style.css";
import type { GameState } from "./game";
import {
  NINJAS,
  DIFFICULTIES,
  createInitialState,
  startGame,
  processAnswer,
  selectNinja,
  selectDifficulty,
  formatProblem,
} from "./game";

// ============================================================================
// STAN APLIKACJI
// ============================================================================

let gameState: GameState = createInitialState();

// ============================================================================
// ELEMENTY DOM
// ============================================================================

const $ = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
};

// Ekrany
const startScreen = $("#start-screen");
const gameScreen = $("#game-screen");

// Start screen
const ninjaGrid = $("#ninja-grid");
const difficultyButtons = $("#difficulty-buttons");
const highScoreValue = $("#high-score-value");
const startBtn = $("#start-btn");

// Game screen
const currentScore = $("#current-score");
const currentStreak = $("#current-streak");
const backBtn = $("#back-btn");
const ninjaAvatar = $("#ninja-avatar");
const problemDisplay = $("#problem-display");
const answerInput = $<HTMLInputElement>("#answer-input");
const submitBtn = $("#submit-btn");
const feedback = $("#feedback");
const ninjaMessage = $("#ninja-message");

// ============================================================================
// RENDEROWANIE
// ============================================================================

/**
 * Generuje SVG avatar ninja
 */
function createNinjaAvatarSVG(
  ninja: (typeof NINJAS)[0],
  size: number = 120
): string {
  return `
    <svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <!-- Tło z kolorem żywiołu -->
      <circle cx="50" cy="50" r="48" fill="${ninja.color}" opacity="0.2"/>
      
      <!-- Ciało ninja -->
      <ellipse cx="50" cy="70" rx="25" ry="20" fill="${ninja.color}"/>
      
      <!-- Głowa -->
      <circle cx="50" cy="35" r="22" fill="${ninja.color}"/>
      
      <!-- Maska ninja (odsłonięte oczy) -->
      <rect x="28" y="28" width="44" height="18" fill="#1a1a1a" rx="4"/>
      
      <!-- Oczy -->
      <ellipse cx="40" cy="35" rx="5" ry="4" fill="white"/>
      <ellipse cx="60" cy="35" rx="5" ry="4" fill="white"/>
      <circle cx="41" cy="35" r="2.5" fill="#222"/>
      <circle cx="61" cy="35" r="2.5" fill="#222"/>
      
      <!-- Blaski w oczach -->
      <circle cx="42" cy="34" r="1" fill="white"/>
      <circle cx="62" cy="34" r="1" fill="white"/>
      
      <!-- Węzeł maski -->
      <circle cx="78" cy="35" r="5" fill="#1a1a1a"/>
      <path d="M 78 40 Q 85 45 82 55" stroke="#1a1a1a" stroke-width="3" fill="none"/>
      <path d="M 78 40 Q 90 42 88 52" stroke="#1a1a1a" stroke-width="3" fill="none"/>
      
      <!-- Symbol żywiołu -->
      <text x="50" y="85" text-anchor="middle" font-size="20">${ninja.emoji}</text>
    </svg>
  `;
}

/**
 * Renderuje siatkę wyboru ninja
 */
function renderNinjaGrid(): void {
  ninjaGrid.innerHTML = NINJAS.map(
    (ninja) => `
    <button 
      class="ninja-card ${
        ninja.id === gameState.currentNinja.id ? "selected" : ""
      }"
      data-ninja-id="${ninja.id}"
      style="--ninja-color: ${ninja.color}"
      title="${ninja.name} - ${ninja.element}"
    >
      <div class="ninja-card-avatar">
        ${createNinjaAvatarSVG(ninja, 80)}
      </div>
      <div class="ninja-card-name">${ninja.name}</div>
      <div class="ninja-card-element">${ninja.emoji} ${ninja.element}</div>
    </button>
  `
  ).join("");
}

/**
 * Renderuje przyciski trudności
 */
function renderDifficultyButtons(): void {
  difficultyButtons.innerHTML = DIFFICULTIES.map(
    (diff) => `
    <button 
      class="difficulty-btn ${
        diff.id === gameState.difficulty.id ? "selected" : ""
      }"
      data-difficulty-id="${diff.id}"
    >
      <span class="difficulty-name">${diff.namePolish}</span>
      <span class="difficulty-desc">${diff.description}</span>
    </button>
  `
  ).join("");
}

/**
 * Renderuje ekran startowy
 */
function renderStartScreen(): void {
  renderNinjaGrid();
  renderDifficultyButtons();
  highScoreValue.textContent = String(gameState.highScore);

  // Ustaw kolor motywu
  document.documentElement.style.setProperty(
    "--current-ninja-color",
    gameState.currentNinja.color
  );
}

/**
 * Renderuje ekran gry
 */
function renderGameScreen(): void {
  currentScore.textContent = String(gameState.score);
  currentStreak.textContent = String(gameState.streak);

  ninjaAvatar.innerHTML = createNinjaAvatarSVG(gameState.currentNinja, 150);

  if (gameState.currentProblem) {
    problemDisplay.textContent = formatProblem(gameState.currentProblem);
  }

  // Wyczyść poprzedni feedback
  feedback.textContent = "";
  feedback.className = "feedback";
  ninjaMessage.textContent = "";

  // Focus na input
  answerInput.value = "";
  answerInput.focus();
}

/**
 * Pokazuje feedback po odpowiedzi
 */
function showFeedback(
  isCorrect: boolean,
  message: string,
  correctAnswer?: number
): void {
  feedback.textContent = isCorrect
    ? "✓ Dobrze!"
    : `✗ Źle! Poprawna odpowiedź: ${correctAnswer}`;
  feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;

  ninjaMessage.textContent = message;
  ninjaMessage.className = `ninja-message ${
    isCorrect ? "encouragement" : "comfort"
  }`;

  // Animacja
  ninjaAvatar.classList.add(isCorrect ? "celebrate" : "shake");
  setTimeout(() => {
    ninjaAvatar.classList.remove("celebrate", "shake");
  }, 500);
}

// ============================================================================
// NAWIGACJA
// ============================================================================

function showScreen(screen: "start" | "game"): void {
  if (screen === "start") {
    startScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    renderStartScreen();
  } else {
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    renderGameScreen();
  }
}

// ============================================================================
// OBSŁUGA ZDARZEŃ
// ============================================================================

/**
 * Obsługa wyboru ninja
 */
ninjaGrid.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const card = target.closest<HTMLElement>(".ninja-card");
  if (!card) return;

  const ninjaId = card.dataset.ninjaId;
  if (ninjaId) {
    gameState = selectNinja(gameState, ninjaId);
    renderNinjaGrid();
    document.documentElement.style.setProperty(
      "--current-ninja-color",
      gameState.currentNinja.color
    );
  }
});

/**
 * Obsługa wyboru trudności
 */
difficultyButtons.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest<HTMLElement>(".difficulty-btn");
  if (!btn) return;

  const difficultyId = btn.dataset.difficultyId;
  if (difficultyId) {
    gameState = selectDifficulty(gameState, difficultyId);
    renderDifficultyButtons();
  }
});

/**
 * Rozpoczęcie gry
 */
startBtn.addEventListener("click", () => {
  gameState = startGame(gameState);
  showScreen("game");
});

/**
 * Powrót do menu
 */
backBtn.addEventListener("click", () => {
  gameState.isGameActive = false;
  showScreen("start");
});

/**
 * Sprawdzenie odpowiedzi
 */
function handleSubmit(): void {
  const userAnswer = parseInt(answerInput.value, 10);

  if (isNaN(userAnswer)) {
    answerInput.classList.add("shake");
    setTimeout(() => answerInput.classList.remove("shake"), 500);
    return;
  }

  const correctAnswer = gameState.currentProblem?.correctAnswer;
  const result = processAnswer(gameState, userAnswer);
  gameState = result.state;

  showFeedback(result.isCorrect, result.message, correctAnswer);

  // Aktualizuj wynik
  currentScore.textContent = String(gameState.score);
  currentStreak.textContent = String(gameState.streak);

  // Nowe zadanie po krótkim opóźnieniu
  setTimeout(() => {
    if (gameState.currentProblem) {
      problemDisplay.textContent = formatProblem(gameState.currentProblem);
    }
    answerInput.value = "";
    answerInput.focus();
    feedback.textContent = "";
    ninjaMessage.textContent = "";
  }, 1500);
}

submitBtn.addEventListener("click", handleSubmit);

answerInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSubmit();
  }
});

// ============================================================================
// INICJALIZACJA
// ============================================================================

function init(): void {
  showScreen("start");
}

// Start!
init();
