/**
 * Ninjago Math Game - Main Entry Point
 *
 * Inicjalizacja gry i obsługa interfejsu użytkownika.
 */

import "./style.css";
import type { GameState, EnemyType } from "./game";
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
  getEnemyType,
  getIdleTimeout,
} from "./game";
import { playSound, getMuted, toggleMuted } from "./sounds";

// ============================================================================
// STAN APLIKACJI
// ============================================================================

let gameState: GameState = createInitialState();
let idleCheckInterval: number | null = null;
let idleTimerInterval: number | null = null;

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
const currentDamage = $("#current-damage");
const backBtn = $("#back-btn");
const ninjaAvatar = $("#ninja-avatar");
const enemyAvatar = $("#enemy-avatar");
const enemyNameDisplay = $("#enemy-name");
const problemDisplay = $("#problem-display");
const answerInput = $<HTMLInputElement>("#answer-input");
const answerDisplay = $("#answer-display");
const feedback = $("#feedback");
const ninjaMessage = $("#ninja-message");

// Custom keyboard
const numpad = $(".numpad");
const backspaceBtn = $("#backspace-btn");
const attackBtn = $("#attack-btn");

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
 * Generuje SVG wroga na podstawie typu
 */
function createEnemyAvatarSVG(
  enemy: EnemyType,
  baseSize: number = 120
): string {
  const size = Math.floor(baseSize * enemy.scale);
  const eyeColor = enemy.isBoss ? "#ff0000" : "#ff4444";
  const glowIntensity = enemy.isBoss ? "0.4" : "0.2";

  // Różne style dla różnych wrogów
  let bodyContent = "";

  switch (enemy.id) {
    case "skeleton":
    case "skeleton-warrior":
      bodyContent = `
        <!-- Ciało szkieleta -->
        <ellipse cx="50" cy="72" rx="22" ry="18" fill="#2d2d2d"/>
        <rect x="38" y="60" width="24" height="3" fill="#d4d4d4" rx="1"/>
        <rect x="40" y="65" width="20" height="3" fill="#d4d4d4" rx="1"/>
        <rect x="42" y="70" width="16" height="3" fill="#d4d4d4" rx="1"/>
        <!-- Czaszka -->
        <circle cx="50" cy="32" r="22" fill="#e8e8e8"/>
        <ellipse cx="40" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="3" fill="${eyeColor}"/>
        <circle cx="60" cy="30" r="3" fill="${eyeColor}"/>
        <path d="M 50 35 L 47 42 L 53 42 Z" fill="#1a1a1a"/>
        <rect x="42" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
        <rect x="48" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
        <rect x="54" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
        ${
          enemy.id === "skeleton-warrior"
            ? '<rect x="75" y="20" width="4" height="40" fill="#808080"/><rect x="72" y="55" width="10" height="4" fill="#8B4513"/>'
            : ""
        }
      `;
      break;
    case "stone-warrior":
      bodyContent = `
        <!-- Kamienny wojownik -->
        <ellipse cx="50" cy="70" rx="28" ry="22" fill="#5a534a"/>
        <rect x="35" y="55" width="30" height="8" fill="#6b5b45" rx="2"/>
        <circle cx="50" cy="32" r="25" fill="#6b5b45"/>
        <ellipse cx="40" cy="30" rx="8" ry="6" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="8" ry="6" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="4" fill="${eyeColor}"/>
        <circle cx="60" cy="30" r="4" fill="${eyeColor}"/>
        <rect x="38" y="45" width="24" height="8" fill="#4a4a4a" rx="2"/>
      `;
      break;
    case "serpentine":
      bodyContent = `
        <!-- Serpentyn -->
        <ellipse cx="50" cy="70" rx="20" ry="24" fill="#1a5a1a"/>
        <path d="M 35 75 Q 25 85 30 95" stroke="#228b22" stroke-width="8" fill="none"/>
        <circle cx="50" cy="30" r="24" fill="#228b22"/>
        <ellipse cx="40" cy="28" rx="6" ry="10" fill="#ffff00"/>
        <ellipse cx="60" cy="28" rx="6" ry="10" fill="#ffff00"/>
        <ellipse cx="40" cy="30" rx="2" ry="6" fill="#000"/>
        <ellipse cx="60" cy="30" rx="2" ry="6" fill="#000"/>
        <path d="M 45 45 Q 50 52 55 45" stroke="#1a1a1a" stroke-width="2" fill="none"/>
        <path d="M 48 48 L 50 55 L 52 48" fill="#ff0000"/>
      `;
      break;
    case "nindroid":
      bodyContent = `
        <!-- Nindroid -->
        <rect x="32" y="55" width="36" height="35" fill="#303030" rx="4"/>
        <rect x="38" y="60" width="24" height="3" fill="#00ff00" opacity="0.5"/>
        <rect x="38" y="66" width="24" height="3" fill="#00ff00" opacity="0.5"/>
        <circle cx="50" cy="30" r="22" fill="#404040"/>
        <rect x="30" y="25" width="40" height="15" fill="#505050" rx="2"/>
        <rect x="35" cy="28" width="12" height="8" fill="#ff0000"/>
        <rect x="53" cy="28" width="12" height="8" fill="#ff0000"/>
        <rect x="45" y="40" width="10" height="3" fill="#606060"/>
      `;
      break;
    case "ghost":
      bodyContent = `
        <!-- Duch -->
        <ellipse cx="50" cy="65" rx="25" ry="30" fill="#00ff88" opacity="0.6"/>
        <path d="M 25 70 Q 30 95 40 90 Q 50 95 60 90 Q 70 95 75 70" fill="#00ff88" opacity="0.6"/>
        <circle cx="50" cy="35" r="22" fill="#00ff88" opacity="0.8"/>
        <ellipse cx="40" cy="33" rx="8" ry="10" fill="#000"/>
        <ellipse cx="60" cy="33" rx="8" ry="10" fill="#000"/>
        <circle cx="42" cy="32" r="3" fill="#00ffff"/>
        <circle cx="62" cy="32" r="3" fill="#00ffff"/>
        <ellipse cx="50" cy="50" rx="8" ry="6" fill="#000" opacity="0.5"/>
      `;
      break;
    case "oni":
      bodyContent = `
        <!-- Oni -->
        <ellipse cx="50" cy="70" rx="26" ry="22" fill="#4a0000"/>
        <circle cx="50" cy="32" r="26" fill="#8b0000"/>
        <!-- Rogi -->
        <path d="M 30 20 L 25 5 L 35 15" fill="#1a1a1a"/>
        <path d="M 70 20 L 75 5 L 65 15" fill="#1a1a1a"/>
        <ellipse cx="38" cy="30" rx="8" ry="6" fill="#ffff00"/>
        <ellipse cx="62" cy="30" rx="8" ry="6" fill="#ffff00"/>
        <circle cx="38" cy="30" r="3" fill="#000"/>
        <circle cx="62" cy="30" r="3" fill="#000"/>
        <rect x="35" y="45" width="30" height="10" fill="#1a1a1a" rx="2"/>
        <rect x="40" y="47" width="5" height="8" fill="#fff"/>
        <rect x="48" y="47" width="5" height="8" fill="#fff"/>
        <rect x="56" y="47" width="5" height="8" fill="#fff"/>
      `;
      break;
    case "dragon-hunter":
      bodyContent = `
        <!-- Łowca Smoków -->
        <ellipse cx="50" cy="70" rx="24" ry="20" fill="#5c4033"/>
        <rect x="35" y="55" width="30" height="12" fill="#8b4513"/>
        <circle cx="50" cy="32" r="22" fill="#deb887"/>
        <ellipse cx="40" cy="30" rx="5" ry="6" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="5" ry="6" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="2" fill="${eyeColor}"/>
        <circle cx="60" cy="30" r="2" fill="${eyeColor}"/>
        <!-- Hełm -->
        <path d="M 28 25 Q 50 5 72 25" fill="#404040"/>
        <rect x="70" y="20" width="8" height="50" fill="#8b4513"/>
        <path d="M 78 20 L 85 15 L 78 30" fill="#808080"/>
      `;
      break;
    case "overlord":
      bodyContent = `
        <!-- Overlord -->
        <ellipse cx="50" cy="68" rx="30" ry="26" fill="#0a0015"/>
        <circle cx="50" cy="30" r="28" fill="#1a0033"/>
        <!-- Korona cieni -->
        <path d="M 22 20 L 30 0 L 38 15 L 50 -5 L 62 15 L 70 0 L 78 20" fill="#4a0080"/>
        <ellipse cx="38" cy="28" rx="10" ry="8" fill="#8b00ff"/>
        <ellipse cx="62" cy="28" rx="10" ry="8" fill="#8b00ff"/>
        <circle cx="38" cy="28" r="4" fill="#ff00ff"/>
        <circle cx="62" cy="28" r="4" fill="#ff00ff"/>
        <!-- Trzecie oko -->
        <ellipse cx="50" cy="15" rx="6" ry="5" fill="#ff0000"/>
        <circle cx="50" cy="15" r="2" fill="#000"/>
        <path d="M 35 50 Q 50 60 65 50" stroke="#8b00ff" stroke-width="3" fill="none"/>
      `;
      break;
    default:
      bodyContent = `
        <ellipse cx="50" cy="72" rx="22" ry="18" fill="#2d2d2d"/>
        <circle cx="50" cy="32" r="22" fill="#e8e8e8"/>
        <circle cx="40" cy="30" r="3" fill="${eyeColor}"/>
        <circle cx="60" cy="30" r="3" fill="${eyeColor}"/>
      `;
  }

  return `
    <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="enemy-svg ${
    enemy.isBoss ? "boss" : ""
  }">
      <!-- Tło z efektem glow dla bossów -->
      <circle cx="50" cy="50" r="48" fill="${
        enemy.color
      }" opacity="${glowIntensity}"/>
      ${
        enemy.isBoss
          ? `<circle cx="50" cy="50" r="48" fill="none" stroke="${enemy.color}" stroke-width="2" opacity="0.6"/>`
          : ""
      }
      
      ${bodyContent}
      
      <!-- Emoji -->
      <text x="50" y="95" text-anchor="middle" font-size="${
        enemy.isBoss ? 18 : 14
      }">${enemy.emoji}</text>
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
  updateDamageDisplay();

  ninjaAvatar.innerHTML = createNinjaAvatarSVG(gameState.currentNinja, 120);
  const currentEnemyType = getEnemyType(gameState.enemyLevel);
  enemyAvatar.innerHTML = createEnemyAvatarSVG(currentEnemyType, 120);
  updateEnemyNameDisplay(currentEnemyType);

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
 * Oblicza aktualne obrażenia na podstawie streaka
 */
function calculateCurrentDamage(): number {
  const streakBonus = Math.min(gameState.streak, 5);
  return (
    COMBAT_CONFIG.PLAYER_ATTACK_DAMAGE +
    streakBonus * COMBAT_CONFIG.STREAK_BONUS_DAMAGE
  );
}

/**
 * Aktualizuje wyświetlanie obrażeń
 */
function updateDamageDisplay(): void {
  currentDamage.textContent = String(calculateCurrentDamage());
}

/**
 * Aktualizuje wyświetlanie nazwy wroga
 */
function updateEnemyNameDisplay(enemy: EnemyType): void {
  enemyNameDisplay.textContent = `${enemy.emoji} ${enemy.name}`;
  enemyNameDisplay.classList.toggle("boss-name", enemy.id === "boss");
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
  finalEnemies.textContent = String(gameState.enemiesDefeated);

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
  const timeout = getIdleTimeout(gameState.enemyLevel);
  const percent = Math.max(0, 100 - (elapsed / timeout) * 100);
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
    answerDisplay.classList.add("shake");
    setTimeout(() => answerDisplay.classList.remove("shake"), 500);
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
  updateDamageDisplay();

  // Sprawdź czy wróg pokonany
  if (result.enemyDefeated) {
    playSound("victory");
    battleEffect.classList.add("enemy-defeated");
    setTimeout(() => battleEffect.classList.remove("enemy-defeated"), 1000);

    // Spawn nowego wroga z animacją
    if (result.newEnemyType) {
      setTimeout(() => {
        const newEnemyType = getEnemyType(gameState.enemyLevel);
        enemyAvatar.classList.add("enemy-spawn");
        enemyAvatar.innerHTML = createEnemyAvatarSVG(newEnemyType, 120);
        updateEnemyNameDisplay(newEnemyType);
        updateHealthBars();

        // Pokaż nazwę nowego wroga
        ninjaMessage.textContent = `Nowy przeciwnik: ${newEnemyType.emoji} ${newEnemyType.name}!`;

        setTimeout(() => {
          enemyAvatar.classList.remove("enemy-spawn");
        }, 600);
      }, 800);
    }
  }

  // Sprawdź czy gracz przegrał
  if (result.playerDefeated) {
    playSound("gameOver");
    showGameOver();
    return;
  }

  // Nowe zadanie natychmiast
  if (gameState.currentProblem && !gameState.isGameOver) {
    problemDisplay.textContent = formatProblem(gameState.currentProblem);
  }
  answerInput.value = "";
  answerDisplay.textContent = "?";

  // Wyczyść feedback po krótkim czasie
  setTimeout(() => {
    feedback.textContent = "";
    ninjaMessage.textContent = "";
  }, 1000);
}

// ============================================================================
// CUSTOM KEYBOARD
// ============================================================================

/**
 * Aktualizuje wyświetlacz odpowiedzi
 */
function updateAnswerDisplay(): void {
  answerDisplay.textContent = answerInput.value || "?";
}

/**
 * Obsługa klawiszy numerycznych
 */
numpad.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const num = target.dataset.num;

  if (num !== undefined && !gameState.isGameOver) {
    playSound("click");
    // Limit do 4 cyfr
    if (answerInput.value.length < 4) {
      answerInput.value += num;
      updateAnswerDisplay();
    }
  }
});

/**
 * Obsługa backspace
 */
backspaceBtn.addEventListener("click", () => {
  if (!gameState.isGameOver && answerInput.value.length > 0) {
    playSound("click");
    answerInput.value = answerInput.value.slice(0, -1);
    updateAnswerDisplay();
  }
});

/**
 * Obsługa ataku (submit)
 */
attackBtn.addEventListener("click", () => {
  if (!gameState.isGameOver) {
    handleSubmit();
  }
});

/**
 * Obsługa klawiatury fizycznej (dla desktopa)
 */
document.addEventListener("keydown", (e) => {
  if (!gameState.isGameActive || gameState.isGameOver) return;

  // Tylko na ekranie gry
  if (gameScreen.classList.contains("hidden")) return;

  if (e.key >= "0" && e.key <= "9") {
    if (answerInput.value.length < 4) {
      answerInput.value += e.key;
      updateAnswerDisplay();
      playSound("click");
    }
  } else if (e.key === "Backspace") {
    if (answerInput.value.length > 0) {
      answerInput.value = answerInput.value.slice(0, -1);
      updateAnswerDisplay();
      playSound("click");
    }
  } else if (e.key === "Enter") {
    handleSubmit();
  }
});

/**
 * Restart gry po przegranej
 */
restartBtn.addEventListener("click", () => {
  playSound("start");
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
  updateDamageDisplay();
  ninjaAvatar.innerHTML = createNinjaAvatarSVG(gameState.currentNinja, 120);
  document.documentElement.style.setProperty(
    "--current-ninja-color",
    gameState.currentNinja.color
  );
  updateHealthBars();
  const initialEnemyType = getEnemyType(gameState.enemyLevel);
  enemyAvatar.innerHTML = createEnemyAvatarSVG(initialEnemyType, 120);
  updateEnemyNameDisplay(initialEnemyType);

  // Pokaż ekran gry
  showScreen("game");
  answerInput.value = "";
  answerDisplay.textContent = "?";
});

/**
 * Powrót do menu głównego po przegranej
 */
menuBtn.addEventListener("click", () => {
  playSound("click");
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
