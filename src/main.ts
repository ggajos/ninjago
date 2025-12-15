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
  COMBAT_CONFIG,
  createInitialState,
  startGame,
  processAnswer,
  processIdleAttack,
  shouldIdleAttack,
  selectNinja,
  selectDifficulty,
  formatProblem,
} from "./game";
import { playSound, getMuted, toggleMuted } from "./sounds";

// ============================================================================
// STAN APLIKACJI
// ============================================================================

let gameState: GameState = createInitialState();
let idleCheckInterval: number | null = null;
let idleTimerInterval: number | null = null;
let enemiesDefeated = 0;

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
const gameoverScreen = $("#gameover-screen");

// Start screen
const ninjaGrid = $("#ninja-grid");
const difficultyButtons = $("#difficulty-buttons");
const highScoreValue = $("#high-score-value");
const startBtn = $("#start-btn");
const muteBtn = $("#mute-btn");

// Game screen
const currentScore = $("#current-score");
const currentStreak = $("#current-streak");
const backBtn = $("#back-btn");
const ninjaAvatar = $("#ninja-avatar");
const enemyAvatar = $("#enemy-avatar");
const problemDisplay = $("#problem-display");
const answerInput = $<HTMLInputElement>("#answer-input");
const submitBtn = $("#submit-btn");
const feedback = $("#feedback");
const ninjaMessage = $("#ninja-message");

// Health bars
const playerHealthFill = $("#player-health-fill");
const playerHealthText = $("#player-health-text");
const enemyHealthFill = $("#enemy-health-fill");
const enemyHealthText = $("#enemy-health-text");

// Battle effects
const battleEffect = $("#battle-effect");
const playerDamagePopup = $("#player-damage-popup");
const enemyDamagePopup = $("#enemy-damage-popup");

// Idle timer
const idleTimerFill = $("#idle-timer-fill");

// Game over screen
const finalScore = $("#final-score");
const finalCorrect = $("#final-correct");
const finalEnemies = $("#final-enemies");
const restartBtn = $("#restart-btn");
const menuBtn = $("#menu-btn");

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
    <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="ninja-svg">
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
 * Generuje SVG wroga (szkielet wojownik)
 */
function createEnemyAvatarSVG(size: number = 120): string {
  return `
    <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="enemy-svg">
      <!-- Tło -->
      <circle cx="50" cy="50" r="48" fill="#4a0080" opacity="0.2"/>
      
      <!-- Ciało szkieleta -->
      <ellipse cx="50" cy="72" rx="22" ry="18" fill="#2d2d2d"/>
      
      <!-- Kości żeber -->
      <rect x="38" y="60" width="24" height="3" fill="#d4d4d4" rx="1"/>
      <rect x="40" y="65" width="20" height="3" fill="#d4d4d4" rx="1"/>
      <rect x="42" y="70" width="16" height="3" fill="#d4d4d4" rx="1"/>
      
      <!-- Czaszka -->
      <circle cx="50" cy="32" r="22" fill="#e8e8e8"/>
      
      <!-- Oczodoły -->
      <ellipse cx="40" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
      <ellipse cx="60" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
      
      <!-- Czerwone oczy -->
      <circle cx="40" cy="30" r="3" fill="#ff0000"/>
      <circle cx="60" cy="30" r="3" fill="#ff0000"/>
      
      <!-- Nos -->
      <path d="M 50 35 L 47 42 L 53 42 Z" fill="#1a1a1a"/>
      
      <!-- Zęby -->
      <rect x="42" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
      <rect x="48" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
      <rect x="54" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
      
      <!-- Miecz -->
      <rect x="75" y="20" width="4" height="40" fill="#808080"/>
      <rect x="72" y="55" width="10" height="4" fill="#8B4513"/>
      
      <!-- Emoji -->
      <text x="50" y="92" text-anchor="middle" font-size="16">💀</text>
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

  ninjaAvatar.innerHTML = createNinjaAvatarSVG(gameState.currentNinja, 120);
  enemyAvatar.innerHTML = createEnemyAvatarSVG(120);

  if (gameState.currentProblem) {
    problemDisplay.textContent = formatProblem(gameState.currentProblem);
  }

  // Update health bars
  updateHealthBars();

  // Wyczyść poprzedni feedback
  feedback.textContent = "";
  feedback.className = "feedback";
  ninjaMessage.textContent = "";

  // Clear damage popups
  playerDamagePopup.textContent = "";
  enemyDamagePopup.textContent = "";
  battleEffect.className = "battle-effect";

  // Focus na input
  answerInput.value = "";
  answerInput.focus();

  // Reset enemies counter
  enemiesDefeated = 0;

  // Start idle timer
  startIdleTimer();
}

/**
 * Aktualizuje paski zdrowia
 */
function updateHealthBars(): void {
  const playerPercent =
    (gameState.playerHealth / gameState.maxPlayerHealth) * 100;
  const enemyPercent = (gameState.enemyHealth / gameState.maxEnemyHealth) * 100;

  playerHealthFill.style.width = `${playerPercent}%`;
  enemyHealthFill.style.width = `${enemyPercent}%`;

  playerHealthText.textContent = `${gameState.playerHealth}/${gameState.maxPlayerHealth}`;
  enemyHealthText.textContent = `${gameState.enemyHealth}/${gameState.maxEnemyHealth}`;

  // Zmiana koloru przy niskim zdrowiu
  playerHealthFill.classList.toggle("low-health", playerPercent <= 30);
  enemyHealthFill.classList.toggle("low-health", enemyPercent <= 30);
}

/**
 * Pokazuje popup z obrażeniami
 */
function showDamagePopup(
  target: "player" | "enemy",
  damage: number,
  heal: boolean = false
): void {
  const popup = target === "player" ? playerDamagePopup : enemyDamagePopup;
  popup.textContent = heal ? `+${damage}` : `-${damage}`;
  popup.className = `damage-popup ${heal ? "heal" : "damage"} show`;

  setTimeout(() => {
    popup.classList.remove("show");
  }, 1000);
}

/**
 * Pokazuje efekt ataku
 */
function showAttackEffect(attacker: "player" | "enemy"): void {
  battleEffect.className = `battle-effect ${attacker}-attack`;

  // Animacja avatara
  if (attacker === "player") {
    ninjaAvatar.classList.add("attacking");
    enemyAvatar.classList.add("hit");
  } else {
    enemyAvatar.classList.add("attacking");
    ninjaAvatar.classList.add("hit");
  }

  setTimeout(() => {
    battleEffect.className = "battle-effect";
    ninjaAvatar.classList.remove("attacking", "hit");
    enemyAvatar.classList.remove("attacking", "hit");
  }, 500);
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
}

/**
 * Pokazuje ekran game over
 */
function showGameOver(): void {
  stopIdleTimer();

  finalScore.textContent = String(gameState.score);
  finalCorrect.textContent = String(gameState.correctAnswers);
  finalEnemies.textContent = String(enemiesDefeated);

  gameScreen.classList.add("hidden");
  gameoverScreen.classList.remove("hidden");
}

// ============================================================================
// IDLE TIMER - Atak wroga przy braku aktywności
// ============================================================================

function startIdleTimer(): void {
  stopIdleTimer();

  // Check every 100ms for idle attack
  idleCheckInterval = window.setInterval(() => {
    if (shouldIdleAttack(gameState)) {
      handleIdleAttack();
    }
  }, 100);

  // Update timer bar every 50ms
  idleTimerInterval = window.setInterval(() => {
    updateIdleTimerBar();
  }, 50);
}

function stopIdleTimer(): void {
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
    idleCheckInterval = null;
  }
  if (idleTimerInterval) {
    clearInterval(idleTimerInterval);
    idleTimerInterval = null;
  }
}

function updateIdleTimerBar(): void {
  if (!gameState.isGameActive || gameState.isGameOver) {
    idleTimerFill.style.width = "100%";
    return;
  }

  const elapsed = Date.now() - gameState.lastAnswerTime;
  const percent = Math.max(
    0,
    100 - (elapsed / COMBAT_CONFIG.IDLE_TIMEOUT_MS) * 100
  );
  idleTimerFill.style.width = `${percent}%`;

  // Czerwieni się gdy mało czasu
  idleTimerFill.classList.toggle("danger", percent <= 30);
}

function handleIdleAttack(): void {
  const result = processIdleAttack(gameState);
  gameState = result.state;

  if (result.attacked) {
    playSound("hit");
    showAttackEffect("enemy");
    showDamagePopup("player", result.damage);
    updateHealthBars();

    ninjaMessage.textContent = "Zbyt wolno! Wróg atakuje!";
    ninjaMessage.className = "ninja-message comfort";

    if (result.playerDefeated) {
      playSound("gameOver");
      showGameOver();
    }
  }
}

// ============================================================================
// NAWIGACJA
// ============================================================================

function showScreen(screen: "start" | "game"): void {
  if (screen === "start") {
    stopIdleTimer();
    startScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    gameoverScreen.classList.add("hidden");
    renderStartScreen();
  } else {
    startScreen.classList.add("hidden");
    gameoverScreen.classList.add("hidden");
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
  playSound("start");
  gameState = startGame(gameState);
  showScreen("game");
});

/**
 * Powrót do menu
 */
backBtn.addEventListener("click", () => {
  playSound("click");
  stopIdleTimer();
  gameState.isGameActive = false;
  showScreen("start");
});

/**
 * Sprawdzenie odpowiedzi
 */
function handleSubmit(): void {
  if (gameState.isGameOver) return;

  const userAnswer = parseInt(answerInput.value, 10);

  if (isNaN(userAnswer)) {
    answerInput.classList.add("shake");
    setTimeout(() => answerInput.classList.remove("shake"), 500);
    return;
  }

  const correctAnswer = gameState.currentProblem?.correctAnswer;
  const result = processAnswer(gameState, userAnswer);
  gameState = result.state;

  // Pokaż animacje walki i odtwórz dźwięki
  if (result.playerAttacked) {
    playSound("correct");
    playSound("attack");
    showAttackEffect("player");
    showDamagePopup("enemy", result.damageDealt);
    // Pokaż heal jeśli gracz się uleczył
    if (result.isCorrect) {
      setTimeout(() => showDamagePopup("player", 5, true), 300);
    }
  } else if (result.enemyAttacked) {
    playSound("wrong");
    playSound("hit");
    showAttackEffect("enemy");
    showDamagePopup("player", result.damageTaken);
  }

  // Aktualizuj paski zdrowia
  updateHealthBars();

  showFeedback(result.isCorrect, result.message, correctAnswer);

  // Aktualizuj wynik
  currentScore.textContent = String(gameState.score);
  currentStreak.textContent = String(gameState.streak);

  // Sprawdź czy wróg pokonany
  if (result.enemyDefeated) {
    enemiesDefeated++;
    playSound("victory");
    battleEffect.classList.add("enemy-defeated");
    setTimeout(() => battleEffect.classList.remove("enemy-defeated"), 1000);
  }

  // Sprawdź czy gracz przegrał
  if (result.playerDefeated) {
    playSound("gameOver");
    showGameOver();
    return;
  }

  // Nowe zadanie po krótkim opóźnieniu
  setTimeout(() => {
    if (gameState.currentProblem && !gameState.isGameOver) {
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

/**
 * Scroll do inputa gdy klawiatura się pojawi na mobile
 */
answerInput.addEventListener("focus", () => {
  // Małe opóźnienie żeby klawiatura zdążyła się pojawić
  setTimeout(() => {
    answerInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
});

/**
 * Restart gry po przegranej
 */
restartBtn.addEventListener("click", () => {
  playSound("start");
  enemiesDefeated = 0;
  const currentNinja = gameState.currentNinja;
  const difficulty = gameState.difficulty;

  // Resetuj stan i rozpocznij grę
  gameState = createInitialState();
  gameState = selectNinja(gameState, currentNinja.id);
  gameState = selectDifficulty(gameState, difficulty.id);
  gameState = startGame(gameState);

  // Aktualizuj UI
  problemDisplay.textContent = formatProblem(gameState.currentProblem!);
  currentScore.textContent = "0";
  currentStreak.textContent = "0";
  ninjaAvatar.innerHTML = createNinjaAvatarSVG(gameState.currentNinja, 120);
  document.documentElement.style.setProperty(
    "--current-ninja-color",
    gameState.currentNinja.color
  );
  updateHealthBars();
  enemyAvatar.innerHTML = createEnemyAvatarSVG(120);

  // Pokaż ekran gry
  showScreen("game");
  answerInput.value = "";
  answerInput.focus();
});

/**
 * Powrót do menu głównego po przegranej
 */
menuBtn.addEventListener("click", () => {
  playSound("click");
  enemiesDefeated = 0;
  showScreen("start");
});

// ============================================================================
// INICJALIZACJA
// ============================================================================

/**
 * Aktualizuje ikonę przycisku mute
 */
function updateMuteButton(): void {
  muteBtn.textContent = getMuted() ? "🔇" : "🔊";
  muteBtn.setAttribute(
    "aria-label",
    getMuted() ? "Włącz dźwięki" : "Wycisz dźwięki"
  );
}

/**
 * Obsługa przycisku mute
 */
muteBtn.addEventListener("click", () => {
  toggleMuted();
  updateMuteButton();
  if (!getMuted()) {
    playSound("click");
  }
});

function init(): void {
  updateMuteButton();
  showScreen("start");
}

// Start!
init();
