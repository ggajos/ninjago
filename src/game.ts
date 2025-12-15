/**
 * Ninjago Math Game - Core Game Logic
 *
 * Gra edukacyjna ucząca dzieci dodawania i odejmowania w świecie Ninjago.
 * Plik zawiera całą logikę gry: typy, generowanie zadań, stan gry, persystencję.
 */

// ============================================================================
// TYPY I INTERFEJSY
// ============================================================================

/** Operacje matematyczne dostępne w grze */
export type MathOperator = "+" | "-";

/** Problem matematyczny do rozwiązania */
export interface MathProblem {
  operand1: number;
  operand2: number;
  operator: MathOperator;
  correctAnswer: number;
}

/** Postać ninja z jej atrybutami */
export interface NinjaCharacter {
  id: string;
  name: string;
  element: string;
  color: string;
  emoji: string;
  avatar: string; // ścieżka do SVG
  encouragements: string[]; // zachęty po poprawnej odpowiedzi
  comforts: string[]; // pocieszenia po błędnej odpowiedzi
}

/** Konfiguracja poziomu trudności */
export interface DifficultyConfig {
  id: string;
  name: string;
  namePolish: string;
  maxNumber: number;
  operators: MathOperator[];
  description: string;
}

/** Stan gry */
export interface GameState {
  currentNinja: NinjaCharacter;
  score: number;
  highScore: number;
  streak: number; // seria poprawnych odpowiedzi
  currentProblem: MathProblem | null;
  difficulty: DifficultyConfig;
  totalProblems: number;
  correctAnswers: number;
  isGameActive: boolean;
  // Combat system
  playerHealth: number;
  maxPlayerHealth: number;
  enemyHealth: number;
  maxEnemyHealth: number;
  isGameOver: boolean;
  lastAnswerTime: number; // timestamp ostatniej odpowiedzi (dla idle attack)
  // Enemy progression
  enemyLevel: number; // poziom wroga (1 = szkielet, 2+ = bossy)
  enemiesDefeated: number; // licznik pokonanych wrogów
}

/** Dane zapisywane w localStorage */
export interface SavedData {
  highScore: number;
  selectedNinjaId: string;
  selectedDifficultyId: string;
}

// ============================================================================
// STAŁE - POSTACIE NINJA
// ============================================================================

export const NINJAS: NinjaCharacter[] = [
  {
    id: "kai",
    name: "Kai",
    element: "Ogień",
    color: "#C41E3A",
    emoji: "🔥",
    avatar: "/avatars/kai.svg",
    encouragements: [
      "Gorąco! Świetna robota!",
      "Płomienne obliczenia!",
      "Ogień! Tak trzymaj!",
      "Rozpalasz się!",
    ],
    comforts: [
      "Nie poddawaj się! Ogień nigdy nie gaśnie!",
      "Spróbuj jeszcze raz, wojowniku!",
      "Każdy ninja się uczy!",
    ],
  },
  {
    id: "jay",
    name: "Jay",
    element: "Błyskawica",
    color: "#0047AB",
    emoji: "⚡",
    avatar: "/avatars/jay.svg",
    encouragements: [
      "Elektrycznie! Błyskawiczna odpowiedź!",
      "Szok! Jak szybko!",
      "Piorunująca robota!",
      "Jesteś jak błyskawica!",
    ],
    comforts: [
      "Hej, nawet błyskawice czasem chybiają!",
      "Spróbuj jeszcze! Będzie super!",
      "Nie martw się, dasz radę!",
    ],
  },
  {
    id: "cole",
    name: "Cole",
    element: "Ziemia",
    color: "#2F2F2F",
    emoji: "🏔️",
    avatar: "/avatars/cole.svg",
    encouragements: [
      "Solidna odpowiedź jak skała!",
      "Mocne! Ziemia się trzęsie!",
      "Niewzruszony jak góra!",
      "Skalna pewność!",
    ],
    comforts: [
      "Bądź silny jak góra, próbuj dalej!",
      "Ziemia jest cierpliwa, Ty też bądź!",
      "Każda góra zaczyna się od kamyka!",
    ],
  },
  {
    id: "zane",
    name: "Zane",
    element: "Lód",
    color: "#87CEEB",
    emoji: "❄️",
    avatar: "/avatars/zane.svg",
    encouragements: [
      "Lodowato precyzyjne!",
      "Chłodna kalkulacja!",
      "Zimna krew, gorący wynik!",
      "Doskonała logika!",
    ],
    comforts: [
      "Analiza błędu pomoże następnym razem.",
      "Spokojnie, oblicz jeszcze raz.",
      "Każdy błąd to nauka!",
    ],
  },
  {
    id: "lloyd",
    name: "Lloyd",
    element: "Energia",
    color: "#228B22",
    emoji: "💚",
    avatar: "/avatars/lloyd.svg",
    encouragements: [
      "Zielona moc! Świetnie!",
      "Energia płynie przez Ciebie!",
      "Mistrzowskie obliczenie!",
      "Prawdziwy Zielony Ninja!",
    ],
    comforts: [
      "Nawet Zielony Ninja musiał się uczyć!",
      "Energia wraca! Spróbuj jeszcze!",
      "Wierzę w Ciebie, wojowniku!",
    ],
  },
  {
    id: "nya",
    name: "Nya",
    element: "Woda",
    color: "#4169E1",
    emoji: "💧",
    avatar: "/avatars/nya.svg",
    encouragements: [
      "Płynna perfekcja!",
      "Jak fala - nie do zatrzymania!",
      "Wodna precyzja!",
      "Świetny przepływ myśli!",
    ],
    comforts: [
      "Woda zawsze znajdzie drogę, Ty też!",
      "Płyń dalej, nie poddawaj się!",
      "Każda kropla się liczy!",
    ],
  },
];

// ============================================================================
// STAŁE - POZIOMY TRUDNOŚCI
// ============================================================================

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: "easy",
    name: "Easy",
    namePolish: "Łatwy",
    maxNumber: 10,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 10",
  },
  {
    id: "medium",
    name: "Medium",
    namePolish: "Średni",
    maxNumber: 20,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 20",
  },
  {
    id: "hard",
    name: "Hard",
    namePolish: "Trudny",
    maxNumber: 50,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 50",
  },
  {
    id: "master",
    name: "Master",
    namePolish: "Mistrz",
    maxNumber: 100,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 100",
  },
];

// ============================================================================
// KLUCZE LOCALSTORAGE
// ============================================================================

const STORAGE_KEY = "ninjago-math-game-save";

// ============================================================================
// STAŁE - SYSTEM WALKI
// ============================================================================

export const COMBAT_CONFIG = {
  PLAYER_MAX_HEALTH: 100,
  ENEMY_BASE_HEALTH: 100, // bazowe zdrowie wroga (poziom 1)
  ENEMY_HEALTH_INCREMENT: 20, // przyrost zdrowia za każdy poziom
  PLAYER_ATTACK_DAMAGE: 15, // obrażenia zadawane wrogowi przy poprawnej odpowiedzi
  ENEMY_ATTACK_DAMAGE: 20, // obrażenia od wroga przy złej odpowiedzi
  IDLE_ATTACK_DAMAGE: 10, // obrażenia od wroga gdy gracz jest nieaktywny
  IDLE_TIMEOUT_MS: 15000, // czas nieaktywności po którym wróg atakuje (15 sekund)
  HEALTH_REGEN_ON_HIT: 5, // regeneracja zdrowia przy poprawnej odpowiedzi
  STREAK_BONUS_DAMAGE: 3, // bonus do obrażeń za każdą serię (max 5)
  SKELETON_REPEATS: 3, // ile razy powtarza się mały szkielet przed bossem
};

// ============================================================================
// TYPY WROGÓW
// ============================================================================

export interface EnemyType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  scale: number; // skala rozmiaru (1 = normalny)
  isBoss: boolean;
}

export const ENEMY_TYPES: EnemyType[] = [
  {
    id: "skeleton",
    name: "Szkielet",
    emoji: "💀",
    color: "#4a0080",
    scale: 1.0,
    isBoss: false,
  },
  {
    id: "skeleton-warrior",
    name: "Szkielet Wojownik",
    emoji: "⚔️",
    color: "#5a1090",
    scale: 1.1,
    isBoss: false,
  },
  {
    id: "stone-warrior",
    name: "Kamienny Wojownik",
    emoji: "🗿",
    color: "#6b5b45",
    scale: 1.2,
    isBoss: true,
  },
  {
    id: "serpentine",
    name: "Serpentyn",
    emoji: "🐍",
    color: "#228b22",
    scale: 1.3,
    isBoss: true,
  },
  {
    id: "nindroid",
    name: "Nindroid",
    emoji: "🤖",
    color: "#404040",
    scale: 1.4,
    isBoss: true,
  },
  {
    id: "ghost",
    name: "Duch",
    emoji: "👻",
    color: "#00ff88",
    scale: 1.5,
    isBoss: true,
  },
  {
    id: "oni",
    name: "Oni",
    emoji: "👹",
    color: "#8b0000",
    scale: 1.6,
    isBoss: true,
  },
  {
    id: "dragon-hunter",
    name: "Łowca Smoków",
    emoji: "🏹",
    color: "#8b4513",
    scale: 1.7,
    isBoss: true,
  },
  {
    id: "overlord",
    name: "Overlord",
    emoji: "😈",
    color: "#1a0033",
    scale: 2.0,
    isBoss: true,
  },
];

/**
 * Zwraca typ wroga na podstawie poziomu
 */
export function getEnemyType(level: number): EnemyType {
  // Poziomy 1-3: losowe szkielety (powtarzają się)
  if (level <= COMBAT_CONFIG.SKELETON_REPEATS) {
    return Math.random() < 0.7 ? ENEMY_TYPES[0] : ENEMY_TYPES[1];
  }

  // Od poziomu 4: kolejni bossi
  const bossIndex = Math.min(
    level - COMBAT_CONFIG.SKELETON_REPEATS + 1,
    ENEMY_TYPES.length - 1
  );
  return ENEMY_TYPES[bossIndex];
}

/**
 * Oblicza zdrowie wroga na podstawie poziomu
 */
export function getEnemyHealth(level: number): number {
  const enemy = getEnemyType(level);
  const baseHealth = COMBAT_CONFIG.ENEMY_BASE_HEALTH;

  // Zdrowie bazowane na skali typu wroga plus wzrost za poziom
  const levelBonus =
    Math.max(0, level - 1) * COMBAT_CONFIG.ENEMY_HEALTH_INCREMENT;
  return Math.floor(baseHealth * enemy.scale + levelBonus);
}

// ============================================================================
// FUNKCJE - GENEROWANIE ZADAŃ
// ============================================================================

/**
 * Generuje losową liczbę całkowitą z zakresu [1, max]
 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

/**
 * Wybiera losowy element z tablicy
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generuje zadanie dodawania.
 * Suma nie przekracza maxNumber i jest zawsze > 0.
 */
export function generateAdditionProblem(maxNumber: number): MathProblem {
  // Zapewniamy że oba operandy są >= 1, więc suma >= 2
  const operand1 = randomInt(Math.max(1, maxNumber - 1));
  const maxOperand2 = Math.max(1, maxNumber - operand1);
  const operand2 = randomInt(maxOperand2);

  return {
    operand1,
    operand2,
    operator: "+",
    correctAnswer: operand1 + operand2,
  };
}

/**
 * Generuje zadanie odejmowania.
 * Wynik jest zawsze dodatni (> 0), czyli operand1 > operand2.
 */
export function generateSubtractionProblem(maxNumber: number): MathProblem {
  // operand1 musi być co najmniej 2, żeby wynik mógł być > 0
  const operand1 = randomInt(Math.max(2, maxNumber - 1)) + 1; // od 2 do maxNumber
  // operand2 musi być mniejszy niż operand1, żeby wynik był > 0
  const operand2 = randomInt(operand1 - 1); // od 1 do operand1-1

  return {
    operand1,
    operand2,
    operator: "-",
    correctAnswer: operand1 - operand2,
  };
}

/**
 * Generuje zadanie zgodne z konfiguracją trudności.
 */
export function generateProblem(difficulty: DifficultyConfig): MathProblem {
  const operator = randomChoice(difficulty.operators);

  if (operator === "+") {
    return generateAdditionProblem(difficulty.maxNumber);
  } else {
    return generateSubtractionProblem(difficulty.maxNumber);
  }
}

/**
 * Sprawdza poprawność odpowiedzi.
 */
export function checkAnswer(problem: MathProblem, userAnswer: number): boolean {
  return problem.correctAnswer === userAnswer;
}

/**
 * Formatuje zadanie jako string do wyświetlenia.
 */
export function formatProblem(problem: MathProblem): string {
  return `${problem.operand1} ${problem.operator} ${problem.operand2} = ?`;
}

// ============================================================================
// FUNKCJE - PERSYSTENCJA (localStorage)
// ============================================================================

/**
 * Zapisuje dane gry do localStorage.
 */
export function saveGameData(data: SavedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage może być niedostępny (np. tryb prywatny)
    console.warn("Nie można zapisać danych gry");
  }
}

/**
 * Wczytuje dane gry z localStorage.
 */
export function loadGameData(): SavedData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as SavedData;
    }
  } catch {
    console.warn("Nie można wczytać danych gry");
  }
  return null;
}

/**
 * Znajduje ninja po ID.
 */
export function findNinjaById(id: string): NinjaCharacter {
  return NINJAS.find((n) => n.id === id) || NINJAS[0];
}

/**
 * Znajduje poziom trudności po ID.
 */
export function findDifficultyById(id: string): DifficultyConfig {
  return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[0];
}

// ============================================================================
// FUNKCJE - STAN GRY
// ============================================================================

/**
 * Tworzy początkowy stan gry.
 */
export function createInitialState(): GameState {
  const savedData = loadGameData();

  const ninja = savedData
    ? findNinjaById(savedData.selectedNinjaId)
    : NINJAS[4]; // Lloyd jako domyślny

  const difficulty = savedData
    ? findDifficultyById(savedData.selectedDifficultyId)
    : DIFFICULTIES[0]; // Łatwy jako domyślny

  const highScore = savedData?.highScore || 0;

  return {
    currentNinja: ninja,
    score: 0,
    highScore,
    streak: 0,
    currentProblem: null,
    difficulty,
    totalProblems: 0,
    correctAnswers: 0,
    isGameActive: false,
    // Combat system
    playerHealth: COMBAT_CONFIG.PLAYER_MAX_HEALTH,
    maxPlayerHealth: COMBAT_CONFIG.PLAYER_MAX_HEALTH,
    enemyHealth: getEnemyHealth(1),
    maxEnemyHealth: getEnemyHealth(1),
    isGameOver: false,
    lastAnswerTime: Date.now(),
    // Enemy progression
    enemyLevel: 1,
    enemiesDefeated: 0,
  };
}

/**
 * Rozpoczyna nową rundę gry.
 */
export function startGame(state: GameState): GameState {
  const initialEnemyHealth = getEnemyHealth(1);
  return {
    ...state,
    score: 0,
    streak: 0,
    currentProblem: generateProblem(state.difficulty),
    totalProblems: 0,
    correctAnswers: 0,
    isGameActive: true,
    // Reset combat
    playerHealth: COMBAT_CONFIG.PLAYER_MAX_HEALTH,
    maxPlayerHealth: COMBAT_CONFIG.PLAYER_MAX_HEALTH,
    enemyHealth: initialEnemyHealth,
    maxEnemyHealth: initialEnemyHealth,
    isGameOver: false,
    lastAnswerTime: Date.now(),
    // Reset enemy progression
    enemyLevel: 1,
    enemiesDefeated: 0,
  };
}

/**
 * Przetwarza odpowiedź gracza.
 */
export function processAnswer(
  state: GameState,
  userAnswer: number
): {
  state: GameState;
  isCorrect: boolean;
  message: string;
  playerAttacked: boolean;
  enemyAttacked: boolean;
  enemyDefeated: boolean;
  playerDefeated: boolean;
  damageDealt: number;
  damageTaken: number;
  newEnemyType: EnemyType | null;
} {
  if (!state.currentProblem || state.isGameOver) {
    return {
      state,
      isCorrect: false,
      message: "",
      playerAttacked: false,
      enemyAttacked: false,
      enemyDefeated: false,
      playerDefeated: false,
      damageDealt: 0,
      damageTaken: 0,
      newEnemyType: null,
    };
  }

  const isCorrect = checkAnswer(state.currentProblem, userAnswer);
  const ninja = state.currentNinja;

  let newScore = state.score;
  let newStreak = state.streak;
  let newHighScore = state.highScore;
  let newPlayerHealth = state.playerHealth;
  let newEnemyHealth = state.enemyHealth;
  let newMaxEnemyHealth = state.maxEnemyHealth;
  let newEnemyLevel = state.enemyLevel;
  let newEnemiesDefeated = state.enemiesDefeated;
  let message: string;
  let damageDealt = 0;
  let damageTaken = 0;
  let enemyDefeated = false;
  let playerDefeated = false;

  if (isCorrect) {
    // Bonus za serię: każda poprawna odpowiedź w serii daje +1 do mnożnika
    const streakBonus = Math.min(newStreak, 5); // max x5
    const points = 10 + streakBonus * 2;
    newScore += points;
    newStreak += 1;
    message = randomChoice(ninja.encouragements);

    if (newScore > newHighScore) {
      newHighScore = newScore;
    }

    // ATAK GRACZA - zadajemy obrażenia wrogowi
    damageDealt =
      COMBAT_CONFIG.PLAYER_ATTACK_DAMAGE +
      streakBonus * COMBAT_CONFIG.STREAK_BONUS_DAMAGE;
    newEnemyHealth = Math.max(0, newEnemyHealth - damageDealt);

    // Regeneracja zdrowia gracza przy trafieniu
    newPlayerHealth = Math.min(
      state.maxPlayerHealth,
      newPlayerHealth + COMBAT_CONFIG.HEALTH_REGEN_ON_HIT
    );

    // Sprawdź czy wróg pokonany
    if (newEnemyHealth <= 0) {
      enemyDefeated = true;
      newEnemiesDefeated++;
      newEnemyLevel++;

      // Nowy wróg z nowym zdrowiem
      const nextEnemyHealth = getEnemyHealth(newEnemyLevel);
      newEnemyHealth = nextEnemyHealth;
      newMaxEnemyHealth = nextEnemyHealth;

      // Bonus punktów za pokonanie wroga (więcej za bossów)
      const enemy = getEnemyType(state.enemyLevel);
      const bossBonus = enemy.isBoss ? 100 : 50;
      newScore += bossBonus;
      if (newScore > newHighScore) {
        newHighScore = newScore;
      }
    }
  } else {
    // ZŁA ODPOWIEDŹ - wróg atakuje gracza
    newStreak = 0;
    message = randomChoice(ninja.comforts);

    damageTaken = COMBAT_CONFIG.ENEMY_ATTACK_DAMAGE;
    newPlayerHealth = Math.max(0, newPlayerHealth - damageTaken);

    // Sprawdź czy gracz pokonany
    if (newPlayerHealth <= 0) {
      playerDefeated = true;
    }
  }

  const newState: GameState = {
    ...state,
    score: newScore,
    highScore: newHighScore,
    streak: newStreak,
    currentProblem: playerDefeated ? null : generateProblem(state.difficulty),
    totalProblems: state.totalProblems + 1,
    correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
    playerHealth: newPlayerHealth,
    enemyHealth: newEnemyHealth,
    maxEnemyHealth: newMaxEnemyHealth,
    isGameOver: playerDefeated,
    lastAnswerTime: Date.now(),
    enemyLevel: newEnemyLevel,
    enemiesDefeated: newEnemiesDefeated,
  };

  // Zapisz postęp
  saveGameData({
    highScore: newHighScore,
    selectedNinjaId: state.currentNinja.id,
    selectedDifficultyId: state.difficulty.id,
  });

  return {
    state: newState,
    isCorrect,
    message,
    playerAttacked: isCorrect,
    enemyAttacked: !isCorrect,
    enemyDefeated,
    playerDefeated,
    damageDealt,
    damageTaken,
    newEnemyType: enemyDefeated ? getEnemyType(newEnemyLevel) : null,
  };
}

/**
 * Przetwarza atak wroga gdy gracz jest nieaktywny.
 */
export function processIdleAttack(state: GameState): {
  state: GameState;
  attacked: boolean;
  damage: number;
  playerDefeated: boolean;
} {
  if (!state.isGameActive || state.isGameOver) {
    return { state, attacked: false, damage: 0, playerDefeated: false };
  }

  const damage = COMBAT_CONFIG.IDLE_ATTACK_DAMAGE;
  const newPlayerHealth = Math.max(0, state.playerHealth - damage);
  const playerDefeated = newPlayerHealth <= 0;

  const newState: GameState = {
    ...state,
    playerHealth: newPlayerHealth,
    isGameOver: playerDefeated,
    lastAnswerTime: Date.now(), // Reset timer
  };

  return {
    state: newState,
    attacked: true,
    damage,
    playerDefeated,
  };
}

/**
 * Sprawdza czy minął czas na idle attack.
 */
export function shouldIdleAttack(state: GameState): boolean {
  if (!state.isGameActive || state.isGameOver) return false;
  const elapsed = Date.now() - state.lastAnswerTime;
  return elapsed >= COMBAT_CONFIG.IDLE_TIMEOUT_MS;
}

/**
 * Zmienia postać ninja.
 */
export function selectNinja(state: GameState, ninjaId: string): GameState {
  const ninja = findNinjaById(ninjaId);

  saveGameData({
    highScore: state.highScore,
    selectedNinjaId: ninja.id,
    selectedDifficultyId: state.difficulty.id,
  });

  return { ...state, currentNinja: ninja };
}

/**
 * Zmienia poziom trudności.
 */
export function selectDifficulty(
  state: GameState,
  difficultyId: string
): GameState {
  const difficulty = findDifficultyById(difficultyId);

  saveGameData({
    highScore: state.highScore,
    selectedNinjaId: state.currentNinja.id,
    selectedDifficultyId: difficulty.id,
  });

  return { ...state, difficulty };
}

/**
 * Zwraca losową zachętę dla aktualnego ninja.
 */
export function getEncouragement(ninja: NinjaCharacter): string {
  return randomChoice(ninja.encouragements);
}

/**
 * Zwraca losowe pocieszenie dla aktualnego ninja.
 */
export function getComfort(ninja: NinjaCharacter): string {
  return randomChoice(ninja.comforts);
}
