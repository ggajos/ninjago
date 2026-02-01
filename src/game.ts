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
  // Statystyki bojowe
  abilityName: string;
  abilityDescription: string;
  attackBonus: number; // bonus do obrażeń
  defense: number; // redukcja otrzymywanych obrażeń
  healthBonus: number; // bonus do max HP
  healthRegen: number; // bonus do regeneracji HP
  streakBonus: number; // bonus do obrażeń za streak
  idleTimeBonus: number; // bonus czasu (ms) na odpowiedź
}

/** Ustawienia gry (zawsze tryb własny) */
export interface GameSettings {
  maxNumber: number;
  operators: MathOperator[];
  disableIdleTimer: boolean;
}

/** Stan gry */
export interface GameState {
  currentNinja: NinjaCharacter;
  score: number;
  highScore: number;
  streak: number; // seria poprawnych odpowiedzi
  maxStreak: number; // najwyższa seria w tej grze
  currentProblem: MathProblem | null;
  settings: GameSettings;
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number; // licznik błędnych odpowiedzi
  isGameActive: boolean;
  gameStartTime: number; // timestamp rozpoczęcia gry
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
  enemiesUntilBoss: number; // ile wrogów do następnego bossa (2-6, losowane)
  currentSegmentEnemies: number; // ile wrogów pokonano w aktualnym segmencie
  bossesDefeated: number; // ile bossów pokonano (do określenia następnego bossa)
}

/** Dane zapisywane w localStorage */
export interface SavedData {
  highScore: number;
  selectedNinjaId: string;
  gameSettings: GameSettings;
  storyPathId?: StoryPathId; // persystencja ścieżki fabularnej
  activeGameState?: ActiveGameState; // zapisany stan aktywnej gry
  gameHistory?: GameHistoryEntry[]; // historia zakończonych gier
}

/** Stan aktywnej gry do zapisania (serializowalny) */
export interface ActiveGameState {
  ninjaId: string;
  score: number;
  streak: number;
  currentProblem: MathProblem | null;
  settings: GameSettings;
  correctAnswers: number;
  incorrectAnswers: number;
  playerHealth: number;
  maxPlayerHealth: number;
  enemyHealth: number;
  maxEnemyHealth: number;
  enemyLevel: number;
  enemiesDefeated: number;
  storyPathId: StoryPathId;
  currentEnemyId: string;
  enemiesUntilBoss: number;
  currentSegmentEnemies: number;
  bossesDefeated: number;
  maxStreak: number; // najwyższa seria w tej grze
  savedAt: number; // timestamp zapisu
  gameStartTime: number; // timestamp rozpoczęcia gry (dla identyfikacji w historii)
}

/** Status gry w historii */
export type GameStatus = "victory" | "defeat" | "in_progress";

/** Wpis w historii gier */
export interface GameHistoryEntry {
  id: string; // unikalny identyfikator
  date: number; // timestamp zakończenia/przerwania
  ninjaId: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  maxStreak: number;
  status: GameStatus; // status gry: victory, defeat, in_progress
  isVictory?: boolean; // DEPRECATED: zachowane dla kompatybilności wstecznej
  settings: GameSettings;
  durationMs: number; // czas trwania gry
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
    // Moc Ognia
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
    // Błyskawica
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
    // Kamienna Zbroja
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
    // Lodowa Tarcza
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
    // Złota Moc (wszystkie bonusy!)
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
    // Fala Uzdrowienia (bez timera!)
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
// DOMYŚLNE USTAWIENIA GRY
// ============================================================================

export const DEFAULT_SETTINGS: GameSettings = {
  maxNumber: 10,
  operators: ["+", "-"],
  disableIdleTimer: false,
};

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
 * @deprecated Użyj getNextEnemy z pełnym stanem gry dla dynamicznych segmentów
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
 * Zwraca następnego wroga na podstawie stanu gry.
 * Używa dynamicznego enemiesUntilBoss zamiast stałej SKELETON_REPEATS.
 */
export function getNextEnemy(state: GameState): {
  enemy: EnemyType;
  isBoss: boolean;
  newSegment: boolean;
  newEnemiesUntilBoss: number;
  newCurrentSegmentEnemies: number;
  newBossesDefeated: number;
} {
  const currentSegment = state.currentSegmentEnemies + 1; // +1 bo właśnie pokonaliśmy wroga

  // Sprawdź czy czas na bossa
  if (currentSegment >= state.enemiesUntilBoss) {
    const bossesDefeated = state.bossesDefeated;

    // Ostatni boss (Overlord) - zawsze na końcu
    if (bossesDefeated >= state.storyPath.bossOrder.length) {
      return {
        enemy: getOverlord(),
        isBoss: true,
        newSegment: false,
        newEnemiesUntilBoss: state.enemiesUntilBoss,
        newCurrentSegmentEnemies: 0,
        newBossesDefeated: bossesDefeated,
      };
    }

    // Boss ze ścieżki
    const bossId = state.storyPath.bossOrder[bossesDefeated];
    return {
      enemy: findEnemyById(bossId),
      isBoss: true,
      newSegment: false,
      newEnemiesUntilBoss: state.enemiesUntilBoss,
      newCurrentSegmentEnemies: 0,
      newBossesDefeated: bossesDefeated,
    };
  }

  // Regularny wróg
  const regularEnemies = getRegularEnemies();
  const randomIndex = Math.floor(Math.random() * regularEnemies.length);
  return {
    enemy: regularEnemies[randomIndex],
    isBoss: false,
    newSegment: false,
    newEnemiesUntilBoss: state.enemiesUntilBoss,
    newCurrentSegmentEnemies: currentSegment,
    newBossesDefeated: state.bossesDefeated,
  };
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
 * Losuje ilość wrogów do następnego bossa (2-6)
 */
export function rollEnemiesUntilBoss(): number {
  return Math.floor(Math.random() * 5) + 2; // 2-6
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
 * Generuje zadanie zgodne z ustawieniami gry.
 */
export function generateProblem(settings: GameSettings): MathProblem {
  const operator = randomChoice(settings.operators);

  switch (operator) {
    case "+":
      return generateAdditionProblem(settings.maxNumber);
    case "-":
      return generateSubtractionProblem(settings.maxNumber);
    case "*":
      return generateMultiplicationProblem(settings.maxNumber);
    case "/":
      return generateDivisionProblem(settings.maxNumber);
    default:
      return generateAdditionProblem(settings.maxNumber);
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
  settings: GameSettings,
  previousProblem: MathProblem | null
): MathProblem {
  let newProblem = generateProblem(settings);
  let attempts = 0;
  const maxAttempts = 10;

  while (isSameProblem(previousProblem, newProblem) && attempts < maxAttempts) {
    newProblem = generateProblem(settings);
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
        typeof parsed.selectedNinjaId !== "string"
      ) {
        console.warn("Corrupted save data, ignoring");
        return null;
      }
      // Walidacja gameSettings (z domyślnymi wartościami dla migracji)
      if (!parsed.gameSettings || typeof parsed.gameSettings !== "object") {
        // Migracja ze starego formatu - użyj domyślnych ustawień
        parsed.gameSettings = { ...DEFAULT_SETTINGS };
      } else {
        const gs = parsed.gameSettings;
        if (
          typeof gs.maxNumber !== "number" ||
          !Array.isArray(gs.operators) ||
          typeof gs.disableIdleTimer !== "boolean"
        ) {
          console.warn("Corrupted gameSettings, using defaults");
          parsed.gameSettings = { ...DEFAULT_SETTINGS };
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
 * Pobiera aktualne ustawienia gry.
 */
export function getGameSettings(): GameSettings {
  const savedData = loadGameData();
  if (savedData?.gameSettings) {
    return savedData.gameSettings;
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Zapisuje ustawienia gry.
 */
export function updateGameSettings(settings: GameSettings): void {
  const savedData = loadGameData();
  saveGameData({
    highScore: savedData?.highScore ?? 0,
    selectedNinjaId: savedData?.selectedNinjaId ?? "kai",
    gameSettings: settings,
    storyPathId: savedData?.storyPathId,
    activeGameState: savedData?.activeGameState,
    gameHistory: savedData?.gameHistory,
  });
}

/**
 * Zapisuje aktywny stan gry do localStorage.
 * Wywoływane po każdej odpowiedzi gracza.
 */
export function saveActiveGameState(state: GameState): void {
  if (!state.isGameActive || state.isGameOver) {
    return; // Nie zapisuj jeśli gra nieaktywna lub zakończona
  }

  const activeState: ActiveGameState = {
    ninjaId: state.currentNinja.id,
    score: state.score,
    streak: state.streak,
    currentProblem: state.currentProblem,
    settings: state.settings,
    correctAnswers: state.correctAnswers,
    incorrectAnswers: state.incorrectAnswers,
    playerHealth: state.playerHealth,
    maxPlayerHealth: state.maxPlayerHealth,
    enemyHealth: state.enemyHealth,
    maxEnemyHealth: state.maxEnemyHealth,
    enemyLevel: state.enemyLevel,
    enemiesDefeated: state.enemiesDefeated,
    storyPathId: state.storyPath.id,
    currentEnemyId: state.currentEnemy.id,
    enemiesUntilBoss: state.enemiesUntilBoss,
    currentSegmentEnemies: state.currentSegmentEnemies,
    bossesDefeated: state.bossesDefeated,
    maxStreak: state.maxStreak,
    savedAt: Date.now(),
    gameStartTime: state.gameStartTime,
  };

  const savedData = loadGameData();
  saveGameData({
    highScore: savedData?.highScore ?? state.highScore,
    selectedNinjaId: state.currentNinja.id,
    gameSettings: state.settings,
    storyPathId: state.storyPath.id,
    activeGameState: activeState,
    gameHistory: savedData?.gameHistory,
  });
}

/**
 * Usuwa zapisany stan aktywnej gry (po zakończeniu).
 */
export function clearActiveGameState(): void {
  const savedData = loadGameData();
  if (savedData) {
    saveGameData({
      ...savedData,
      activeGameState: undefined,
    });
  }
}

/**
 * Sprawdza czy jest zapisany stan aktywnej gry.
 */
export function hasActiveGameState(): boolean {
  const savedData = loadGameData();
  return !!savedData?.activeGameState;
}

/**
 * Przywraca stan gry z zapisanego stanu.
 */
export function restoreGameState(savedData: SavedData): GameState | null {
  const activeState = savedData.activeGameState;
  if (!activeState) return null;

  const ninja = findNinjaById(activeState.ninjaId);
  const storyPath = findStoryPathById(activeState.storyPathId);
  const currentEnemy = findEnemyById(activeState.currentEnemyId);

  // Użyj zapisanego gameStartTime jeśli dostępny, w przeciwnym razie oszacuj
  const gameStartTime = activeState.gameStartTime ?? 
    (activeState.savedAt - (activeState.correctAnswers + activeState.incorrectAnswers) * 5000);

  return {
    currentNinja: ninja,
    score: activeState.score,
    highScore: savedData.highScore,
    streak: activeState.streak,
    maxStreak: activeState.maxStreak,
    currentProblem: activeState.currentProblem,
    settings: activeState.settings,
    totalProblems: activeState.correctAnswers, // approximation
    correctAnswers: activeState.correctAnswers,
    incorrectAnswers: activeState.incorrectAnswers,
    isGameActive: true,
    gameStartTime: gameStartTime,
    playerHealth: activeState.playerHealth,
    maxPlayerHealth: activeState.maxPlayerHealth,
    enemyHealth: activeState.enemyHealth,
    maxEnemyHealth: activeState.maxEnemyHealth,
    isGameOver: false,
    isVictory: false,
    lastAnswerTime: Date.now(), // reset idle timer
    enemyLevel: activeState.enemyLevel,
    enemiesDefeated: activeState.enemiesDefeated,
    storyPath,
    currentEnemy,
    enemiesUntilBoss: activeState.enemiesUntilBoss,
    currentSegmentEnemies: activeState.currentSegmentEnemies,
    bossesDefeated: activeState.bossesDefeated,
  };
}

/**
 * Pomocnicza funkcja do usunięcia istniejącego wpisu in_progress dla tej samej gry.
 * Porównuje czas rozpoczęcia gry (gameStartTime).
 */
function removeExistingInProgressEntry(
  history: GameHistoryEntry[],
  gameStartTime: number
): GameHistoryEntry[] {
  return history.filter((entry) => {
    // Zachowaj wszystkie zakończone gry
    if (entry.status !== "in_progress") return true;
    // Sprawdź czy to ta sama gra po czasie rozpoczęcia
    const entryStartTime = entry.date - entry.durationMs;
    const timeDiff = Math.abs(entryStartTime - gameStartTime);
    // Jeśli różnica < 5 minut - to prawdopodobnie ta sama gra, usuń
    if (timeDiff < 300000) {
      return false;
    }
    return true;
  });
}

/**
 * Dodaje grę do historii.
 * Jeśli status to "in_progress", najpierw usuwa istniejący wpis in_progress dla tej samej gry.
 * @param state - aktualny stan gry
 * @param status - status gry (domyślnie na podstawie stanu gry)
 * @param clearActiveState - czy wyczyścić aktywny stan gry (domyślnie true dla victory/defeat)
 */
export function addGameToHistory(
  state: GameState,
  status?: GameStatus,
  clearActiveState?: boolean
): string {
  const savedData = loadGameData();
  let history = savedData?.gameHistory ?? [];

  // Określ status na podstawie stanu gry jeśli nie podano
  const gameStatus: GameStatus =
    status ?? (state.isVictory ? "victory" : state.isGameOver ? "defeat" : "in_progress");

  // Domyślnie czyść aktywny stan tylko dla zakończonych gier
  const shouldClearActiveState = clearActiveState ?? gameStatus !== "in_progress";

  // Jeśli dodajemy in_progress, najpierw usuń istniejący wpis in_progress dla tej gry
  if (gameStatus === "in_progress") {
    history = removeExistingInProgressEntry(history, state.gameStartTime);
  }

  const entryId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const entry: GameHistoryEntry = {
    id: entryId,
    date: Date.now(),
    ninjaId: state.currentNinja.id,
    score: state.score,
    correctAnswers: state.correctAnswers,
    incorrectAnswers: state.incorrectAnswers,
    enemiesDefeated: state.enemiesDefeated,
    bossesDefeated: state.bossesDefeated,
    maxStreak: state.maxStreak,
    status: gameStatus,
    settings: state.settings,
    durationMs: state.gameStartTime > 0 ? Date.now() - state.gameStartTime : 0,
  };

  // Ogranicz historię do 50 ostatnich gier
  const newHistory = [entry, ...history].slice(0, 50);

  saveGameData({
    highScore: savedData?.highScore ?? state.highScore,
    selectedNinjaId: state.currentNinja.id,
    gameSettings: state.settings,
    storyPathId: savedData?.storyPathId,
    activeGameState: shouldClearActiveState ? undefined : savedData?.activeGameState,
    gameHistory: newHistory,
  });

  return entryId;
}

/**
 * Pobiera historię gier.
 */
export function getGameHistory(): GameHistoryEntry[] {
  const savedData = loadGameData();
  return savedData?.gameHistory ?? [];
}

/**
 * Aktualizuje wpis w historii gier (np. gdy gra in_progress zostanie dokończona).
 * Usuwa stary wpis in_progress dla tej samej gry i dodaje nowy z aktualnym statusem.
 */
export function updateGameInHistory(
  state: GameState,
  status: GameStatus
): void {
  const savedData = loadGameData();
  if (!savedData) return;

  const history = savedData.gameHistory ?? [];

  // Usuń istniejący wpis in_progress dla tej samej gry
  const filteredHistory = removeExistingInProgressEntry(history, state.gameStartTime);

  // Dodaj nowy wpis z aktualnym statusem
  const entry: GameHistoryEntry = {
    id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: Date.now(),
    ninjaId: state.currentNinja.id,
    score: state.score,
    correctAnswers: state.correctAnswers,
    incorrectAnswers: state.incorrectAnswers,
    enemiesDefeated: state.enemiesDefeated,
    bossesDefeated: state.bossesDefeated,
    maxStreak: state.maxStreak,
    status: status,
    settings: state.settings,
    durationMs: state.gameStartTime > 0 ? Date.now() - state.gameStartTime : 0,
  };

  const newHistory = [entry, ...filteredHistory].slice(0, 50);

  saveGameData({
    ...savedData,
    activeGameState: undefined, // Czyść aktywny stan - gra zakończona
    gameHistory: newHistory,
  });
}

/**
 * Sprawdza czy istnieje gra w toku (in_progress) w historii.
 */
export function hasInProgressGame(): boolean {
  const savedData = loadGameData();
  return savedData?.activeGameState !== undefined;
}

/**
 * Czyści całą historię gier.
 */
export function clearGameHistory(): void {
  const savedData = loadGameData();
  if (savedData) {
    saveGameData({
      ...savedData,
      gameHistory: [],
    });
  }
}

// ============================================================================
// FUNKCJE - STAN GRY
// ============================================================================

/**
 * Tworzy początkowy stan gry.
 */
export function createInitialState(): GameState {
  const savedData = loadGameData();

  // Ustal ustawienia gry
  const settings = savedData?.gameSettings ?? { ...DEFAULT_SETTINGS };

  // Ustal ninja
  const ninja = savedData
    ? findNinjaById(savedData.selectedNinjaId)
    : NINJAS[0]; // Kai jako domyślny

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

  // Losuj ile wrogów do pierwszego bossa
  const enemiesUntilBoss = rollEnemiesUntilBoss();

  return {
    currentNinja: ninja,
    score: 0,
    highScore,
    streak: 0,
    maxStreak: 0,
    currentProblem: null,
    settings,
    totalProblems: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    isGameActive: false,
    gameStartTime: 0,
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
    enemiesUntilBoss,
    currentSegmentEnemies: 0,
    bossesDefeated: 0,
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

  // Losuj ile wrogów do pierwszego bossa
  const enemiesUntilBoss = rollEnemiesUntilBoss();

  const now = Date.now();
  
  return {
    ...state,
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentProblem: generateProblem(state.settings),
    totalProblems: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    isGameActive: true,
    gameStartTime: now,
    // Reset combat
    playerHealth: maxHealth,
    maxPlayerHealth: maxHealth,
    enemyHealth: initialEnemyHealth,
    maxEnemyHealth: initialEnemyHealth,
    isGameOver: false,
    isVictory: false,
    lastAnswerTime: now,
    // Reset enemy progression
    enemyLevel: 1,
    enemiesDefeated: 0,
    storyPath,
    currentEnemy: initialEnemy,
    enemiesUntilBoss,
    currentSegmentEnemies: 0,
    bossesDefeated: 0,
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
  bossDefeated: boolean;
  defeatedBossName: string | null;
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
      bossDefeated: false,
      defeatedBossName: null,
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
  let newCurrentSegmentEnemies = state.currentSegmentEnemies;
  let newEnemiesUntilBoss = state.enemiesUntilBoss;
  let newBossesDefeated = state.bossesDefeated;
  let message: string;
  let damageDealt = 0;
  let damageTaken = 0;
  let enemyDefeated = false;
  let bossDefeated = false;
  let defeatedBossName: string | null = null;
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
        // Następny wróg - używamy nowej logiki z dynamicznym segmentem
        newEnemyLevel++;

        // Jeśli pokonaliśmy bossa, resetuj segment i losuj nową ilość wrogów
        if (state.currentEnemy.isBoss) {
          bossDefeated = true;
          defeatedBossName = state.currentEnemy.name;
          newBossesDefeated++;
          newCurrentSegmentEnemies = 0; // Reset - zaczynamy nowy segment od 0
          newEnemiesUntilBoss = rollEnemiesUntilBoss();
          
          // Po pokonaniu bossa: następny wróg to ZAWSZE regularny wróg
          // (nie wywołujemy getNextEnemy bo to zacząłoby liczyć od 1)
          const regularEnemies = ENEMY_TYPES.filter((e) => !e.isBoss);
          const randomIndex = Math.floor(Math.random() * regularEnemies.length);
          newEnemy = regularEnemies[randomIndex];
        } else {
          // Pokonaliśmy regularnego wroga - inkrementujemy licznik
          newCurrentSegmentEnemies++;
          
          // Sprawdź czy czas na bossa
          if (newCurrentSegmentEnemies >= newEnemiesUntilBoss) {
            // Następny wróg to boss
            if (newBossesDefeated >= state.storyPath.bossOrder.length) {
              // Overlord!
              newEnemy = ENEMY_TYPES.find((e) => e.id === "overlord") ?? ENEMY_TYPES[0];
            } else {
              // Boss ze ścieżki
              const bossId = state.storyPath.bossOrder[newBossesDefeated];
              newEnemy = findEnemyById(bossId);
            }
          } else {
            // Regularny wróg
            const regularEnemies = ENEMY_TYPES.filter((e) => !e.isBoss);
            const randomIndex = Math.floor(Math.random() * regularEnemies.length);
            newEnemy = regularEnemies[randomIndex];
          }
        }

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

  // Oblicz maxStreak
  const newMaxStreak = Math.max(state.maxStreak, newStreak);

  const newState: GameState = {
    ...state,
    score: newScore,
    highScore: newHighScore,
    streak: newStreak,
    maxStreak: newMaxStreak,
    // Nowe zadanie tylko przy poprawnej odpowiedzi - przy błędnej to samo zadanie
    currentProblem:
      playerDefeated || isVictory
        ? null
        : isCorrect
        ? generateUniqueProblem(state.settings, state.currentProblem)
        : state.currentProblem,
    totalProblems: state.totalProblems + (isCorrect ? 1 : 0), // Licznik tylko przy poprawnych
    correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
    incorrectAnswers: state.incorrectAnswers + (isCorrect ? 0 : 1),
    playerHealth: newPlayerHealth,
    enemyHealth: newEnemyHealth,
    maxEnemyHealth: newMaxEnemyHealth,
    isGameOver: playerDefeated || isVictory,
    isVictory,
    lastAnswerTime: Date.now(),
    enemyLevel: newEnemyLevel,
    enemiesDefeated: newEnemiesDefeated,
    currentEnemy: newEnemy,
    enemiesUntilBoss: newEnemiesUntilBoss,
    currentSegmentEnemies: newCurrentSegmentEnemies,
    bossesDefeated: newBossesDefeated,
  };

  // Zapisz postęp (włącznie ze ścieżką fabularną)
  saveGameData({
    highScore: newHighScore,
    selectedNinjaId: state.currentNinja.id,
    gameSettings: state.settings,
    storyPathId: state.storyPath.id,
  });

  return {
    state: newState,
    isCorrect,
    message,
    playerAttacked: isCorrect,
    enemyAttacked: !isCorrect,
    enemyDefeated,
    bossDefeated,
    defeatedBossName,
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
  // Timer wyłączony w ustawieniach
  if (state.settings.disableIdleTimer) return false;

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
    gameSettings: state.settings,
    storyPathId: state.storyPath.id,
  });

  return { ...state, currentNinja: ninja };
}

/**
 * Aktualizuje ustawienia gry w stanie.
 */
export function applySettings(state: GameState, settings: GameSettings): GameState {
  saveGameData({
    highScore: state.highScore,
    selectedNinjaId: state.currentNinja.id,
    gameSettings: settings,
    storyPathId: state.storyPath.id,
  });

  return {
    ...state,
    settings,
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
