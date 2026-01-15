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
export type MathOperator = "+" | "-" | "*" | "/";

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
  // Powiązanie z poziomem trudności i statystyki bojowe
  difficultyId: string;
  abilityName: string;
  abilityDescription: string;
  attackBonus: number; // bonus do obrażeń
  defense: number; // redukcja otrzymywanych obrażeń
  healthBonus: number; // bonus do max HP
  healthRegen: number; // bonus do regeneracji HP
  streakBonus: number; // bonus do obrażeń za streak
  idleTimeBonus: number; // bonus czasu (ms) na odpowiedź
}

/** Konfiguracja poziomu trudności */
export interface DifficultyConfig {
  id: string;
  name: string;
  namePolish: string;
  maxNumber: number;
  operators: MathOperator[];
  description: string;
  disableIdleTimer: boolean;
  isCustom?: boolean; // czy to tryb niestandardowy
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
  isVictory: boolean; // czy gracz wygrał (pokonał Overlorda)
  lastAnswerTime: number; // timestamp ostatniej odpowiedzi (dla idle attack)
  // Enemy progression
  enemyLevel: number; // poziom wroga (1 = szkielet, 2+ = bossy)
  enemiesDefeated: number; // licznik pokonanych wrogów
  storyPath: StoryPath; // aktualna ścieżka fabularna
  currentEnemy: EnemyType; // aktualny wróg (cache - nie losujemy przy każdym renderze)
}

/** Dane zapisywane w localStorage */
export interface SavedData {
  highScore: number;
  selectedNinjaId: string;
  selectedDifficultyId: string;
  customDifficulty?: CustomDifficultySettings;
  storyPathId?: StoryPathId; // persystencja ścieżki fabularnej
}

/** Ustawienia niestandardowego poziomu trudności */
export interface CustomDifficultySettings {
  maxNumber: number;
  operators: MathOperator[];
  disableIdleTimer: boolean;
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
    // Bardzo trudny - Moc Ognia
    difficultyId: "very-hard",
    abilityName: "Moc Ognia",
    abilityDescription: "+5 obrażeń, +1 bonus za serię",
    attackBonus: 5,
    defense: 0,
    healthBonus: 0,
    healthRegen: 0,
    streakBonus: 1,
    idleTimeBonus: 0,
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
    // Trudny - Błyskawica
    difficultyId: "hard",
    abilityName: "Błyskawica",
    abilityDescription: "+3s czasu, +1 bonus za serię",
    attackBonus: 0,
    defense: 0,
    healthBonus: 0,
    healthRegen: 0,
    streakBonus: 1,
    idleTimeBonus: 3000,
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
    // Średni - Kamienna Zbroja
    difficultyId: "medium",
    abilityName: "Kamienna Zbroja",
    abilityDescription: "+10 HP, -2 otrzymanych obrażeń",
    attackBonus: 0,
    defense: 2,
    healthBonus: 10,
    healthRegen: 0,
    streakBonus: 0,
    idleTimeBonus: 0,
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
    // Łatwy - Lodowa Tarcza
    difficultyId: "easy",
    abilityName: "Lodowa Tarcza",
    abilityDescription: "+1s czasu, +1 regeneracji HP",
    attackBonus: 0,
    defense: 0,
    healthBonus: 0,
    healthRegen: 1,
    streakBonus: 0,
    idleTimeBonus: 1000,
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
    // Mistrz - Złota Moc (wszystkie bonusy!)
    difficultyId: "master",
    abilityName: "Złota Moc",
    abilityDescription: "+3 obrażeń, +10 HP, +2 regen, +1 seria",
    attackBonus: 3,
    defense: 0,
    healthBonus: 10,
    healthRegen: 2,
    streakBonus: 1,
    idleTimeBonus: 0,
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
    // Bardzo łatwy - Fala Uzdrowienia (bez timera!)
    difficultyId: "very-easy",
    abilityName: "Fala Uzdrowienia",
    abilityDescription: "+2 regeneracji HP, bez limitu czasu!",
    attackBonus: 0,
    defense: 0,
    healthBonus: 0,
    healthRegen: 2,
    streakBonus: 0,
    idleTimeBonus: 0,
  },
];

// ============================================================================
// STAŁE - POZIOMY TRUDNOŚCI
// ============================================================================

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: "very-easy",
    name: "Very Easy",
    namePolish: "Bardzo łatwy",
    maxNumber: 5,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 5",
    disableIdleTimer: true,
  },
  {
    id: "easy",
    name: "Easy",
    namePolish: "Łatwy",
    maxNumber: 10,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 10",
    disableIdleTimer: false,
  },
  {
    id: "medium",
    name: "Medium",
    namePolish: "Średni",
    maxNumber: 20,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 20",
    disableIdleTimer: false,
  },
  {
    id: "hard",
    name: "Hard",
    namePolish: "Trudny",
    maxNumber: 35,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 35",
    disableIdleTimer: false,
  },
  {
    id: "very-hard",
    name: "Very Hard",
    namePolish: "Bardzo trudny",
    maxNumber: 50,
    operators: ["+", "-"],
    description: "Dodawanie i odejmowanie do 50",
    disableIdleTimer: false,
  },
  {
    id: "custom",
    name: "Custom",
    namePolish: "Własny",
    maxNumber: 10,
    operators: ["+", "-"],
    description: "Dostosuj ustawienia",
    disableIdleTimer: false,
    isCustom: true,
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
  IDLE_TIMEOUT_MAX_MS: 15000, // maksymalny czas nieaktywności (poziom 1)
  IDLE_TIMEOUT_MIN_MS: 8000, // minimalny czas nieaktywności (finalny boss)
  HEALTH_REGEN_ON_HIT: 5, // regeneracja zdrowia przy poprawnej odpowiedzi
  STREAK_BONUS_DAMAGE: 3, // bonus do obrażeń za każdą serię (max 5)
  SKELETON_REPEATS: 3, // ile razy powtarza się mały szkielet przed bossem
  // Stała wyjaśniająca offset między poziomem a indeksem bossa
  // Poziom 5 = pierwszy boss (index 0), więc: bossIndex = level - SKELETON_REPEATS - 2
  // -2 bo: -SKELETON_REPEATS (3) daje level 2, a chcemy index 0, więc jeszcze -2
  BOSS_LEVEL_OFFSET: 2,
} as const;

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
  // Wrogowie regularni (losowani na początku)
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
    id: "skeleton-archer",
    name: "Szkielet Łucznik",
    emoji: "🏹",
    color: "#6a2090",
    scale: 1.0,
    isBoss: false,
  },
  {
    id: "shadow-scout",
    name: "Zwiadowca Cienia",
    emoji: "👤",
    color: "#2a2040",
    scale: 1.1,
    isBoss: false,
  },
  // Bossy
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
    emoji: "🐉",
    color: "#8b4513",
    scale: 1.7,
    isBoss: true,
  },
  // Mini-bossy (dodatkowi przeciwnicy między głównymi bossami)
  {
    id: "ice-samurai",
    name: "Lodowy Samuraj",
    emoji: "❄️",
    color: "#87ceeb",
    scale: 1.25,
    isBoss: true,
  },
  {
    id: "shadow-master",
    name: "Mistrz Cienia",
    emoji: "🌑",
    color: "#1a1a2e",
    scale: 1.35,
    isBoss: true,
  },
  {
    id: "pyro-viper",
    name: "Ognisty Wąż",
    emoji: "🔥",
    color: "#ff4500",
    scale: 1.45,
    isBoss: true,
  },
  // Final boss
  {
    id: "overlord",
    name: "Overlord",
    emoji: "😈",
    color: "#1a0033",
    scale: 2.0,
    isBoss: true,
  },
];

// ============================================================================
// SYSTEM ŚCIEŻEK FABULARNYCH
// ============================================================================

/** Identyfikatory ścieżek fabularnych */
export type StoryPathId = "serpentine" | "tech" | "shadow" | "classic";

/** Ścieżka fabularna - kolejność bossów */
export interface StoryPath {
  id: StoryPathId;
  name: string;
  description: string;
  bossOrder: string[]; // id bossów w kolejności (bez Overlorda - zawsze na końcu)
}

/** Dostępne ścieżki fabularne */
export const STORY_PATHS: StoryPath[] = [
  {
    id: "serpentine",
    name: "Inwazja Serpentynów",
    description: "Węże atakują Ninjago!",
    bossOrder: [
      "serpentine",
      "pyro-viper",
      "stone-warrior",
      "shadow-master",
      "oni",
      "dragon-hunter",
    ],
  },
  {
    id: "tech",
    name: "Cyberprzejęcie",
    description: "Nindroids przejęły kontrolę!",
    bossOrder: [
      "nindroid",
      "ice-samurai",
      "ghost",
      "shadow-master",
      "stone-warrior",
      "dragon-hunter",
    ],
  },
  {
    id: "shadow",
    name: "Cienie z Otchłani",
    description: "Mroczne moce budzą się...",
    bossOrder: [
      "ghost",
      "shadow-master",
      "oni",
      "ice-samurai",
      "serpentine",
      "dragon-hunter",
    ],
  },
  {
    id: "classic",
    name: "Klasyczna Przygoda",
    description: "Tradycyjna podróż ninja",
    bossOrder: [
      "stone-warrior",
      "serpentine",
      "nindroid",
      "ghost",
      "oni",
      "dragon-hunter",
    ],
  },
];

// ============================================================================
// WALIDACJA ŚCIEŻEK FABULARNYCH (compile-time i runtime)
// ============================================================================

/** Wszystkie poprawne ID bossów (do walidacji) */
const VALID_BOSS_IDS = new Set(
  ENEMY_TYPES.filter((e) => e.isBoss && e.id !== "overlord").map((e) => e.id)
);

/** Waliduje ścieżkę fabularną - sprawdza czy wszystkie ID bossów istnieją */
function validateStoryPath(path: StoryPath): void {
  if (path.bossOrder.length === 0) {
    throw new Error(`Story path "${path.id}" has empty bossOrder array`);
  }
  for (const bossId of path.bossOrder) {
    if (!VALID_BOSS_IDS.has(bossId)) {
      throw new Error(
        `Invalid boss ID "${bossId}" in story path "${path.id}". Valid IDs: ${[
          ...VALID_BOSS_IDS,
        ].join(", ")}`
      );
    }
  }
}

// Waliduj wszystkie ścieżki przy starcie (fail-fast)
STORY_PATHS.forEach(validateStoryPath);

/** Znajduje ścieżkę po ID z walidacją */
export function findStoryPathById(id: StoryPathId): StoryPath {
  const path = STORY_PATHS.find((p) => p.id === id);
  if (!path) {
    console.warn(`Story path "${id}" not found, falling back to classic`);
    return STORY_PATHS.find((p) => p.id === "classic") ?? STORY_PATHS[0];
  }
  return path;
}

/** Domyślna ścieżka (classic) - z walidacją */
export function getDefaultStoryPath(): StoryPath {
  return findStoryPathById("classic");
}

/** Losuje ścieżkę fabularną */
export function getRandomStoryPath(): StoryPath {
  if (STORY_PATHS.length === 0) {
    throw new Error("CRITICAL: No story paths defined in STORY_PATHS");
  }
  const index = Math.floor(Math.random() * STORY_PATHS.length);
  return STORY_PATHS[index];
}

/** Znajduje wroga po ID z walidacją */
export function findEnemyById(id: string): EnemyType {
  const enemy = ENEMY_TYPES.find((e) => e.id === id);
  if (!enemy) {
    console.error(`Enemy "${id}" not found, falling back to skeleton`);
    return ENEMY_TYPES[0]; // fallback do pierwszego wroga
  }
  return enemy;
}

/** Zwraca Overlorda (final boss) z walidacją */
function getOverlord(): EnemyType {
  const overlord = ENEMY_TYPES.find((e) => e.id === "overlord");
  if (!overlord) {
    throw new Error("CRITICAL: Overlord enemy type not found in ENEMY_TYPES");
  }
  return overlord;
}

/** Zwraca listę wrogów regularnych (nie-bossów) - leniwe obliczanie */
function getRegularEnemies(): EnemyType[] {
  return ENEMY_TYPES.filter((e) => !e.isBoss);
}

/** Maksymalny poziom regularnych wrogów (przed bossami) */
const REGULAR_ENEMY_MAX_LEVEL = COMBAT_CONFIG.SKELETON_REPEATS + 1;

/**
 * Zwraca typ wroga na podstawie poziomu i ścieżki fabularnej.
 * UWAGA: Ta funkcja jest deterministyczna dla bossów, ale losowa dla regularnych wrogów.
 * Dla spójnego UI używaj state.currentEnemy zamiast wywoływać tę funkcję wielokrotnie.
 */
export function getEnemyType(level: number, storyPath?: StoryPath): EnemyType {
  // Poziomy 1-4: losowi wrogowie regularni
  if (level <= REGULAR_ENEMY_MAX_LEVEL) {
    const regularEnemies = getRegularEnemies();
    if (regularEnemies.length === 0) {
      console.error("No regular enemies found, falling back to first enemy");
      return ENEMY_TYPES[0];
    }
    const randomIndex = Math.floor(Math.random() * regularEnemies.length);
    return regularEnemies[randomIndex];
  }

  // Bez ścieżki - użyj domyślnej (classic)
  const path = storyPath ?? getDefaultStoryPath();

  // Oblicz indeks bossa używając nazwanej stałej
  const bossIndex =
    level - COMBAT_CONFIG.SKELETON_REPEATS - COMBAT_CONFIG.BOSS_LEVEL_OFFSET;

  // Ostatni boss (Overlord) - zawsze na końcu
  if (bossIndex >= path.bossOrder.length) {
    return getOverlord();
  }

  // Boss ze ścieżki
  const bossId = path.bossOrder[bossIndex];
  return findEnemyById(bossId);
}

/**
 * Oblicza zdrowie wroga na podstawie poziomu i typu wroga.
 * Przyjmuje EnemyType bezpośrednio żeby uniknąć wielokrotnego losowania.
 */
export function getEnemyHealthForType(level: number, enemy: EnemyType): number {
  const baseHealth = COMBAT_CONFIG.ENEMY_BASE_HEALTH;
  const levelBonus =
    Math.max(0, level - 1) * COMBAT_CONFIG.ENEMY_HEALTH_INCREMENT;
  return Math.floor(baseHealth * enemy.scale + levelBonus);
}

/**
 * Oblicza zdrowie wroga na podstawie poziomu (legacy - używa losowego wroga dla poziomów 1-4).
 * @deprecated Użyj getEnemyHealthForType z konkretnym typem wroga
 */
export function getEnemyHealth(level: number, storyPath?: StoryPath): number {
  const enemy = getEnemyType(level, storyPath);
  return getEnemyHealthForType(level, enemy);
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
 * Generuje zadanie mnożenia.
 * Oba czynniki są z zakresu [1, sqrt(maxNumber)] dla przyjaznych wyników.
 * Dla dzieci: małe liczby (tabliczka mnożenia do 10x10).
 */
export function generateMultiplicationProblem(maxNumber: number): MathProblem {
  // Maksymalny czynnik to ~pierwiastek z maxNumber, ale nie więcej niż 10
  const maxFactor = Math.min(10, Math.floor(Math.sqrt(maxNumber)));
  const operand1 = randomInt(Math.max(1, maxFactor));
  const operand2 = randomInt(Math.max(1, maxFactor));

  return {
    operand1,
    operand2,
    operator: "*",
    correctAnswer: operand1 * operand2,
  };
}

/**
 * Generuje zadanie dzielenia.
 * Wynik jest zawsze liczbą całkowitą > 0 (dzielenie bez reszty).
 * Generujemy iloczyn, a potem dzielimy - gwarantuje wynik całkowity.
 */
export function generateDivisionProblem(maxNumber: number): MathProblem {
  // Maksymalny dzielnik/wynik to ~pierwiastek z maxNumber, ale nie więcej niż 10
  const maxFactor = Math.min(10, Math.floor(Math.sqrt(maxNumber)));
  const divisor = randomInt(Math.max(1, maxFactor)); // dzielnik
  const quotient = randomInt(Math.max(1, maxFactor)); // wynik
  const dividend = divisor * quotient; // dzielna = dzielnik * wynik

  return {
    operand1: dividend,
    operand2: divisor,
    operator: "/",
    correctAnswer: quotient,
  };
}

/**
 * Generuje zadanie zgodne z konfiguracją trudności.
 */
export function generateProblem(difficulty: DifficultyConfig): MathProblem {
  const operator = randomChoice(difficulty.operators);

  switch (operator) {
    case "+":
      return generateAdditionProblem(difficulty.maxNumber);
    case "-":
      return generateSubtractionProblem(difficulty.maxNumber);
    case "*":
      return generateMultiplicationProblem(difficulty.maxNumber);
    case "/":
      return generateDivisionProblem(difficulty.maxNumber);
    default:
      return generateAdditionProblem(difficulty.maxNumber);
  }
}

/**
 * Sprawdza czy dwa zadania są identyczne.
 */
function isSameProblem(a: MathProblem | null, b: MathProblem): boolean {
  if (!a) return false;
  return (
    a.operand1 === b.operand1 &&
    a.operand2 === b.operand2 &&
    a.operator === b.operator
  );
}

/**
 * Generuje nowe zadanie, które jest różne od poprzedniego.
 * Próbuje maksymalnie 10 razy, potem zwraca cokolwiek.
 */
export function generateUniqueProblem(
  difficulty: DifficultyConfig,
  previousProblem: MathProblem | null
): MathProblem {
  let newProblem = generateProblem(difficulty);
  let attempts = 0;
  const maxAttempts = 10;

  while (isSameProblem(previousProblem, newProblem) && attempts < maxAttempts) {
    newProblem = generateProblem(difficulty);
    attempts++;
  }

  return newProblem;
}

/**
 * Sprawdza poprawność odpowiedzi.
 */
export function checkAnswer(problem: MathProblem, userAnswer: number): boolean {
  return problem.correctAnswer === userAnswer;
}

/**
 * Formatuje zadanie jako string do wyświetlenia.
 * Używa znaków przyjaznych dla dzieci (× zamiast *, ÷ zamiast /).
 */
export function formatProblem(problem: MathProblem): string {
  let operatorSymbol: string = problem.operator;
  if (problem.operator === "*") operatorSymbol = "×";
  if (problem.operator === "/") operatorSymbol = "÷";
  return `${problem.operand1} ${operatorSymbol} ${problem.operand2} = ?`;
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
 * Waliduje strukturę danych - jeśli dane są uszkodzone, zwraca null.
 */
export function loadGameData(): SavedData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Walidacja wymaganych pól
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        typeof parsed.highScore !== "number" ||
        typeof parsed.selectedNinjaId !== "string" ||
        typeof parsed.selectedDifficultyId !== "string"
      ) {
        console.warn("Corrupted save data, ignoring");
        return null;
      }
      // Opcjonalna walidacja customDifficulty
      if (parsed.customDifficulty) {
        const cd = parsed.customDifficulty;
        if (
          typeof cd.maxNumber !== "number" ||
          !Array.isArray(cd.operators) ||
          typeof cd.disableIdleTimer !== "boolean"
        ) {
          console.warn("Corrupted customDifficulty, stripping from save");
          parsed.customDifficulty = undefined;
        }
      }
      // Opcjonalna walidacja storyPathId
      if (parsed.storyPathId && typeof parsed.storyPathId !== "string") {
        console.warn("Corrupted storyPathId, stripping from save");
        parsed.storyPathId = undefined;
      }
      return parsed as SavedData;
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
  const ninja = NINJAS.find((n) => n.id === id);
  if (!ninja) {
    console.warn(`Ninja "${id}" not found, falling back to ${NINJAS[0].id}`);
    return NINJAS[0];
  }
  return ninja;
}

/**
 * Znajduje poziom trudności po ID.
 */
export function findDifficultyById(id: string): DifficultyConfig {
  const difficulty = DIFFICULTIES.find((d) => d.id === id);
  if (!difficulty) {
    console.warn(
      `Difficulty "${id}" not found, falling back to ${DIFFICULTIES[0].id}`
    );
    return DIFFICULTIES[0];
  }
  return difficulty;
}

/**
 * Aktualizuje ustawienia trybu Custom.
 * Zapisuje ustawienia do localStorage i zwraca NOWĄ konfigurację.
 * UWAGA: Ta funkcja NIE mutuje globalnej tablicy DIFFICULTIES.
 */
export function updateCustomDifficulty(
  settings: CustomDifficultySettings
): DifficultyConfig {
  const baseCustomDiff = DIFFICULTIES.find((d) => d.id === "custom");
  if (!baseCustomDiff) {
    throw new Error("Custom difficulty not found");
  }

  // Zapisz ustawienia do localStorage
  const savedData = loadGameData();
  saveGameData({
    highScore: savedData?.highScore ?? 0,
    selectedNinjaId: savedData?.selectedNinjaId ?? "kai",
    selectedDifficultyId: savedData?.selectedDifficultyId ?? "very-easy",
    storyPathId: savedData?.storyPathId,
    customDifficulty: settings,
  });

  // Zwróć NOWY obiekt zamiast mutować istniejący
  return {
    ...baseCustomDiff,
    maxNumber: settings.maxNumber,
    operators: [...settings.operators], // kopia tablicy
    disableIdleTimer: settings.disableIdleTimer,
    description: generateCustomDescription(settings),
  };
}

/**
 * Generuje opis dla trybu Custom na podstawie ustawień.
 */
function generateCustomDescription(settings: CustomDifficultySettings): string {
  const ops = settings.operators
    .map((op) => {
      switch (op) {
        case "+":
          return "dodawanie";
        case "-":
          return "odejmowanie";
        case "*":
          return "mnożenie";
        case "/":
          return "dzielenie";
        default:
          return op;
      }
    })
    .join(", ");
  const timer = settings.disableIdleTimer ? ", bez timera" : "";
  return `${ops} do ${settings.maxNumber}${timer}`;
}

/**
 * Pobiera aktualne ustawienia trybu Custom.
 */
export function getCustomDifficultySettings(): CustomDifficultySettings {
  const savedData = loadGameData();
  if (savedData?.customDifficulty) {
    return savedData.customDifficulty;
  }
  // Domyślne ustawienia
  return {
    maxNumber: 10,
    operators: ["+", "-"],
    disableIdleTimer: false,
  };
}

/**
 * Znajduje ninja przypisanego do danego poziomu trudności.
 * Dla trybu custom zwraca Lloyda (Zielony Ninja - uniwersalny).
 */
export function getNinjaForDifficulty(difficultyId: string): NinjaCharacter {
  if (difficultyId === "custom") {
    return findNinjaById("lloyd"); // Lloyd dla custom mode
  }
  return NINJAS.find((n) => n.difficultyId === difficultyId) || NINJAS[0];
}

// ============================================================================
// FUNKCJE - STAN GRY
// ============================================================================

/**
 * Tworzy początkowy stan gry.
 */
export function createInitialState(): GameState {
  const savedData = loadGameData();

  // Najpierw ustal poziom trudności
  const difficulty = savedData
    ? findDifficultyById(savedData.selectedDifficultyId)
    : DIFFICULTIES[0]; // Bardzo łatwy jako domyślny

  // Ninja jest automatycznie przypisany do poziomu trudności
  const ninja = getNinjaForDifficulty(difficulty.id);

  const highScore = savedData?.highScore || 0;

  // Oblicz max HP z bonusem ninja
  const maxHealth = COMBAT_CONFIG.PLAYER_MAX_HEALTH + ninja.healthBonus;

  // Przywróć zapisaną ścieżkę lub losuj nową
  const storyPath = savedData?.storyPathId
    ? findStoryPathById(savedData.storyPathId)
    : getRandomStoryPath();

  // Wylosuj pierwszego wroga i policz jego zdrowie
  const initialEnemy = getEnemyType(1, storyPath);
  const initialEnemyHealth = getEnemyHealthForType(1, initialEnemy);

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
    playerHealth: maxHealth,
    maxPlayerHealth: maxHealth,
    enemyHealth: initialEnemyHealth,
    maxEnemyHealth: initialEnemyHealth,
    isGameOver: false,
    isVictory: false,
    lastAnswerTime: Date.now(),
    // Enemy progression
    enemyLevel: 1,
    enemiesDefeated: 0,
    storyPath,
    currentEnemy: initialEnemy,
  };
}

/**
 * Rozpoczyna nową rundę gry.
 */
export function startGame(state: GameState): GameState {
  // Oblicz max HP z bonusem ninja
  const maxHealth =
    COMBAT_CONFIG.PLAYER_MAX_HEALTH + state.currentNinja.healthBonus;

  // Nowa losowa ścieżka fabularna na każdą grę
  const storyPath = getRandomStoryPath();

  // Wylosuj pierwszego wroga i policz jego zdrowie
  const initialEnemy = getEnemyType(1, storyPath);
  const initialEnemyHealth = getEnemyHealthForType(1, initialEnemy);

  return {
    ...state,
    score: 0,
    streak: 0,
    currentProblem: generateProblem(state.difficulty),
    totalProblems: 0,
    correctAnswers: 0,
    isGameActive: true,
    // Reset combat
    playerHealth: maxHealth,
    maxPlayerHealth: maxHealth,
    enemyHealth: initialEnemyHealth,
    maxEnemyHealth: initialEnemyHealth,
    isGameOver: false,
    isVictory: false,
    lastAnswerTime: Date.now(),
    // Reset enemy progression
    enemyLevel: 1,
    enemiesDefeated: 0,
    storyPath,
    currentEnemy: initialEnemy,
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
  isVictory: boolean;
  damageDealt: number;
  damageTaken: number;
  newEnemyType: EnemyType | null;
} {
  if (!state.currentProblem || state.isGameOver || state.isVictory) {
    return {
      state,
      isCorrect: false,
      message: "",
      playerAttacked: false,
      enemyAttacked: false,
      enemyDefeated: false,
      playerDefeated: false,
      isVictory: false,
      damageDealt: 0,
      damageTaken: 0,
      newEnemyType: null,
    };
  }

  // Sanitize input - handle NaN, Infinity, -Infinity as wrong answer
  const sanitizedAnswer = Number.isFinite(userAnswer) ? userAnswer : NaN;
  const isCorrect =
    Number.isFinite(sanitizedAnswer) &&
    checkAnswer(state.currentProblem, sanitizedAnswer);
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
  let isVictory = false;
  let newEnemy = state.currentEnemy; // domyślnie ten sam wróg

  if (isCorrect) {
    // Bonus za serię: każda poprawna odpowiedź w serii daje +1 do mnożnika
    // + bonus od ninja (streakBonus zwiększa obrażenia za każdy poziom serii)
    const streakBonus = Math.min(newStreak, 5); // max x5
    const points = 10 + streakBonus * 2;
    newScore += points;
    newStreak += 1;
    message = randomChoice(ninja.encouragements);

    if (newScore > newHighScore) {
      newHighScore = newScore;
    }

    // ATAK GRACZA - zadajemy obrażenia wrogowi
    // Bazowe obrażenia + bonus ninja + bonus za streak (z bonusem ninja)
    const streakDamagePerLevel =
      COMBAT_CONFIG.STREAK_BONUS_DAMAGE + ninja.streakBonus;
    damageDealt =
      COMBAT_CONFIG.PLAYER_ATTACK_DAMAGE +
      ninja.attackBonus +
      streakBonus * streakDamagePerLevel;
    newEnemyHealth = Math.max(0, newEnemyHealth - damageDealt);

    // Regeneracja zdrowia gracza przy trafieniu (z bonusem ninja)
    const healthRegen = COMBAT_CONFIG.HEALTH_REGEN_ON_HIT + ninja.healthRegen;
    newPlayerHealth = Math.min(
      state.maxPlayerHealth,
      newPlayerHealth + healthRegen
    );

    // Sprawdź czy wróg pokonany
    if (newEnemyHealth <= 0) {
      enemyDefeated = true;
      newEnemiesDefeated++;

      // Sprawdź czy pokonaliśmy Overlorda (WYGRANA!)
      if (state.currentEnemy.id === "overlord") {
        isVictory = true;
        // Bonus za pokonanie Overlorda
        newScore += 500;
        if (newScore > newHighScore) {
          newHighScore = newScore;
        }
      } else {
        // Następny wróg
        newEnemyLevel++;
        newEnemy = getEnemyType(newEnemyLevel, state.storyPath);
        const nextEnemyHealth = getEnemyHealthForType(newEnemyLevel, newEnemy);
        newEnemyHealth = nextEnemyHealth;
        newMaxEnemyHealth = nextEnemyHealth;

        // Bonus punktów za pokonanie wroga (więcej za bossów)
        const bossBonus = state.currentEnemy.isBoss ? 100 : 50;
        newScore += bossBonus;
        if (newScore > newHighScore) {
          newHighScore = newScore;
        }
      }
    }
  } else {
    // ZŁA ODPOWIEDŹ - wróg atakuje gracza
    newStreak = 0;
    message = randomChoice(ninja.comforts);

    // Obrażenia od wroga pomniejszone o obronę ninja
    damageTaken = Math.max(
      1,
      COMBAT_CONFIG.ENEMY_ATTACK_DAMAGE - ninja.defense
    );
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
    currentProblem:
      playerDefeated || isVictory
        ? null
        : generateUniqueProblem(state.difficulty, state.currentProblem),
    totalProblems: state.totalProblems + 1,
    correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
    playerHealth: newPlayerHealth,
    enemyHealth: newEnemyHealth,
    maxEnemyHealth: newMaxEnemyHealth,
    isGameOver: playerDefeated || isVictory,
    isVictory,
    lastAnswerTime: Date.now(),
    enemyLevel: newEnemyLevel,
    enemiesDefeated: newEnemiesDefeated,
    currentEnemy: newEnemy,
  };

  // Zapisz postęp (włącznie ze ścieżką fabularną)
  saveGameData({
    highScore: newHighScore,
    selectedNinjaId: state.currentNinja.id,
    selectedDifficultyId: state.difficulty.id,
    storyPathId: state.storyPath.id,
  });

  return {
    state: newState,
    isCorrect,
    message,
    playerAttacked: isCorrect,
    enemyAttacked: !isCorrect,
    enemyDefeated,
    playerDefeated,
    isVictory,
    damageDealt,
    damageTaken,
    // Zwróć nowego wroga jeśli poprzedni pokonany (ale nie wygrana!)
    newEnemyType: enemyDefeated && !isVictory ? newEnemy : null,
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

  // Apply ninja defense to idle damage (same as regular attacks)
  const damage = Math.max(
    1,
    COMBAT_CONFIG.IDLE_ATTACK_DAMAGE - state.currentNinja.defense
  );
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
 * Oblicza timeout na podstawie poziomu wroga i bonusu ninja.
 * Od 15s (poziom 1) do 8s (finalny boss - poziom 10+)
 * + bonus czasu od ninja (idleTimeBonus)
 */
export function getIdleTimeout(
  level: number,
  ninjaIdleBonus: number = 0
): number {
  const maxLevel = ENEMY_TYPES.length + COMBAT_CONFIG.SKELETON_REPEATS - 1; // ~11
  const progress = Math.min(level - 1, maxLevel - 1) / (maxLevel - 1); // 0 do 1
  const range =
    COMBAT_CONFIG.IDLE_TIMEOUT_MAX_MS - COMBAT_CONFIG.IDLE_TIMEOUT_MIN_MS;
  const baseTimeout = Math.floor(
    COMBAT_CONFIG.IDLE_TIMEOUT_MAX_MS - progress * range
  );
  return baseTimeout + ninjaIdleBonus;
}

/**
 * Sprawdza czy minął czas na idle attack.
 * Jeśli timer jest wyłączony (disableIdleTimer), zawsze zwraca false.
 */
export function shouldIdleAttack(state: GameState): boolean {
  if (!state.isGameActive || state.isGameOver) return false;
  // Timer wyłączony dla poziomu "Bardzo łatwy"
  if (state.difficulty.disableIdleTimer) return false;

  const elapsed = Date.now() - state.lastAnswerTime;
  const timeout = getIdleTimeout(
    state.enemyLevel,
    state.currentNinja.idleTimeBonus
  );
  return elapsed >= timeout;
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
    storyPathId: state.storyPath.id,
  });

  return { ...state, currentNinja: ninja };
}

/**
 * Zmienia poziom trudności i automatycznie wybiera przypisanego ninja.
 * Dla trybu "custom" aplikuje zapisane ustawienia.
 */
export function selectDifficulty(
  state: GameState,
  difficultyId: string
): GameState {
  let difficulty = findDifficultyById(difficultyId);

  // Dla trybu custom, aplikuj zapisane ustawienia
  if (difficultyId === "custom") {
    const customSettings = getCustomDifficultySettings();
    difficulty = {
      ...difficulty,
      maxNumber: customSettings.maxNumber,
      operators: [...customSettings.operators],
      disableIdleTimer: customSettings.disableIdleTimer,
      description: `${customSettings.operators
        .map((op) => {
          switch (op) {
            case "+":
              return "dodawanie";
            case "-":
              return "odejmowanie";
            case "*":
              return "mnożenie";
            case "/":
              return "dzielenie";
            default:
              return op;
          }
        })
        .join(", ")} do ${customSettings.maxNumber}${
        customSettings.disableIdleTimer ? ", bez timera" : ""
      }`,
    };
  }

  // Automatycznie wybierz ninja przypisanego do tego poziomu trudności
  const ninja = getNinjaForDifficulty(difficultyId);
  // Oblicz nowe max HP z bonusem ninja
  const maxHealth = COMBAT_CONFIG.PLAYER_MAX_HEALTH + ninja.healthBonus;

  saveGameData({
    highScore: state.highScore,
    selectedNinjaId: ninja.id,
    selectedDifficultyId: difficulty.id,
    storyPathId: state.storyPath.id,
  });

  return {
    ...state,
    difficulty,
    currentNinja: ninja,
    maxPlayerHealth: maxHealth,
    playerHealth: maxHealth,
  };
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
