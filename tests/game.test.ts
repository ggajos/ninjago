/**
 * Ninjago Math Game - Smoke Tests
 *
 * Podstawowe testy integracyjne sprawdzające poprawność działania gry.
 * Przygotowane pod kątem dalszego rozwoju - łatwe do rozszerzenia.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type {
  MathProblem,
  GameSettings,
  StoryPathId,
} from "../src/game";
import {
  // Stałe
  NINJAS,
  DEFAULT_SETTINGS,
  ENEMY_TYPES,
  STORY_PATHS,
  COMBAT_CONFIG,

  // Funkcje generowania zadań
  generateAdditionProblem,
  generateSubtractionProblem,
  generateMultiplicationProblem,
  generateDivisionProblem,
  generateProblem,
  generateUniqueProblem,
  checkAnswer,
  formatProblem,

  // Funkcje stanu gry
  createInitialState,
  startGame,
  processAnswer,
  selectNinja,
  applySettings,

  // Story paths
  getRandomStoryPath,
  findStoryPathById,
  getDefaultStoryPath,
  findEnemyById,
  getEnemyType,
  getEnemyHealthForType,

  // Persystencja
  saveGameData,
  loadGameData,
  findNinjaById,
} from "../src/game";

// ============================================================================
// SMOKE TESTS - Generowanie zadań matematycznych
// ============================================================================

describe("Math Problem Generation", () => {
  describe("generateAdditionProblem", () => {
    it("should create a valid addition problem", () => {
      const problem = generateAdditionProblem(10);

      expect(problem.operator).toBe("+");
      expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2);
    });

    it("should generate numbers within the specified range", () => {
      // Test wielokrotnie dla losowości
      for (let i = 0; i < 100; i++) {
        const problem = generateAdditionProblem(10);

        expect(problem.operand1).toBeGreaterThanOrEqual(1);
        expect(problem.operand2).toBeGreaterThanOrEqual(1);
        expect(problem.correctAnswer).toBeLessThanOrEqual(10);
      }
    });

    it("should work with different max numbers", () => {
      const easyProblem = generateAdditionProblem(10);
      expect(easyProblem.correctAnswer).toBeLessThanOrEqual(10);

      const hardProblem = generateAdditionProblem(100);
      expect(hardProblem.correctAnswer).toBeLessThanOrEqual(100);
    });
  });

  describe("generateSubtractionProblem", () => {
    it("should create a valid subtraction problem", () => {
      const problem = generateSubtractionProblem(10);

      expect(problem.operator).toBe("-");
      expect(problem.correctAnswer).toBe(problem.operand1 - problem.operand2);
    });

    it("should always produce positive results (child-friendly, > 0)", () => {
      // Test wielokrotnie dla losowości
      for (let i = 0; i < 100; i++) {
        const problem = generateSubtractionProblem(50);

        expect(problem.correctAnswer).toBeGreaterThan(0);
        expect(problem.operand1).toBeGreaterThan(problem.operand2);
      }
    });
  });

  describe("generateProblem", () => {
    it("should generate problems based on settings config", () => {
      const easySettings: GameSettings = {
        maxNumber: 10,
        operators: ["+"],
        disableIdleTimer: false,
      };

      const problem = generateProblem(easySettings);
      expect(problem.operator).toBe("+");
    });

    it("should respect settings operators", () => {
      const settings: GameSettings = {
        maxNumber: 10,
        operators: ["+", "-"],
        disableIdleTimer: false,
      };

      for (let i = 0; i < 50; i++) {
        const problem = generateProblem(settings);
        expect(["+", "-"]).toContain(problem.operator);
      }
    });
  });

  describe("checkAnswer", () => {
    it("should return true for correct answer", () => {
      const problem: MathProblem = {
        operand1: 5,
        operand2: 3,
        operator: "+",
        correctAnswer: 8,
      };

      expect(checkAnswer(problem, 8)).toBe(true);
    });

    it("should return false for incorrect answer", () => {
      const problem: MathProblem = {
        operand1: 5,
        operand2: 3,
        operator: "+",
        correctAnswer: 8,
      };

      expect(checkAnswer(problem, 7)).toBe(false);
      expect(checkAnswer(problem, 9)).toBe(false);
    });
  });

  describe("formatProblem", () => {
    it("should format addition problem correctly", () => {
      const problem: MathProblem = {
        operand1: 5,
        operand2: 3,
        operator: "+",
        correctAnswer: 8,
      };

      expect(formatProblem(problem)).toBe("5 + 3 = ?");
    });

    it("should format subtraction problem correctly", () => {
      const problem: MathProblem = {
        operand1: 10,
        operand2: 4,
        operator: "-",
        correctAnswer: 6,
      };

      expect(formatProblem(problem)).toBe("10 - 4 = ?");
    });
  });
});

// ============================================================================
// SMOKE TESTS - Stan gry
// ============================================================================

describe("Game State Management", () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => store[key] || null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      store[key] = value;
    });
  });

  describe("createInitialState", () => {
    it("should create valid initial state", () => {
      const state = createInitialState();

      expect(state.score).toBe(0);
      expect(state.streak).toBe(0);
      expect(state.isGameActive).toBe(false);
      expect(state.currentProblem).toBeNull();
      expect(state.currentNinja).toBeDefined();
      expect(state.settings).toBeDefined();
    });

    it("should have Kai as default ninja (first ninja in list)", () => {
      const state = createInitialState();
      expect(state.currentNinja.id).toBe("kai");
    });

    it("should have default settings (maxNumber: 10, operators: [+, -])", () => {
      const state = createInitialState();
      expect(state.settings.maxNumber).toBe(10);
      expect(state.settings.operators).toEqual(["+", "-"]);
      expect(state.settings.disableIdleTimer).toBe(false);
    });
  });

  describe("startGame", () => {
    it("should activate game and generate first problem", () => {
      const initialState = createInitialState();
      const gameState = startGame(initialState);

      expect(gameState.isGameActive).toBe(true);
      expect(gameState.currentProblem).not.toBeNull();
      expect(gameState.score).toBe(0);
      expect(gameState.streak).toBe(0);
    });
  });

  describe("processAnswer", () => {
    it("should increase score for correct answer", () => {
      let state = createInitialState();
      state = startGame(state);
      const correctAnswer = state.currentProblem!.correctAnswer;

      const result = processAnswer(state, correctAnswer);

      expect(result.isCorrect).toBe(true);
      expect(result.state.score).toBeGreaterThan(0);
      expect(result.state.streak).toBe(1);
      expect(result.state.correctAnswers).toBe(1);
    });

    it("should reset streak for incorrect answer", () => {
      let state = createInitialState();
      state = startGame(state);
      state = { ...state, streak: 5 }; // Simulate existing streak

      const wrongAnswer = state.currentProblem!.correctAnswer + 999;
      const result = processAnswer(state, wrongAnswer);

      expect(result.isCorrect).toBe(false);
      expect(result.state.streak).toBe(0);
    });

    it("should provide ninja message", () => {
      let state = createInitialState();
      state = startGame(state);
      const correctAnswer = state.currentProblem!.correctAnswer;

      const result = processAnswer(state, correctAnswer);

      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe("string");
    });

    it("should generate new problem after answer", () => {
      let state = createInitialState();
      state = startGame(state);

      const result = processAnswer(state, 999);

      // Nowe zadanie powinno być wygenerowane
      expect(result.state.currentProblem).not.toBeNull();
      // Może być takie samo przez przypadek, więc sprawdzamy tylko czy istnieje
      expect(result.state.currentProblem).toBeDefined();
    });
  });

  describe("selectNinja", () => {
    it("should change current ninja", () => {
      const state = createInitialState();
      const newState = selectNinja(state, "kai");

      expect(newState.currentNinja.id).toBe("kai");
      expect(newState.currentNinja.name).toBe("Kai");
    });

    it("should preserve other state properties", () => {
      let state = createInitialState();
      state = { ...state, score: 100, highScore: 200 };

      const newState = selectNinja(state, "zane");

      expect(newState.score).toBe(100);
      expect(newState.highScore).toBe(200);
    });
  });

  describe("applySettings", () => {
    it("should change game settings", () => {
      const state = createInitialState();
      const newSettings: GameSettings = {
        maxNumber: 50,
        operators: ["*", "/"],
        disableIdleTimer: true,
      };
      
      const newState = applySettings(state, newSettings);

      expect(newState.settings.maxNumber).toBe(50);
      expect(newState.settings.operators).toEqual(["*", "/"]);
      expect(newState.settings.disableIdleTimer).toBe(true);
    });
  });
});

// ============================================================================
// SMOKE TESTS - Dane stałe
// ============================================================================

describe("Game Constants", () => {
  describe("NINJAS", () => {
    it("should have all 6 main ninjas", () => {
      expect(NINJAS).toHaveLength(6);

      const ninjaIds = NINJAS.map((n) => n.id);
      expect(ninjaIds).toContain("kai");
      expect(ninjaIds).toContain("jay");
      expect(ninjaIds).toContain("cole");
      expect(ninjaIds).toContain("zane");
      expect(ninjaIds).toContain("lloyd");
      expect(ninjaIds).toContain("nya");
    });

    it("should have encouragements for each ninja", () => {
      for (const ninja of NINJAS) {
        expect(ninja.encouragements.length).toBeGreaterThan(0);
        expect(ninja.comforts.length).toBeGreaterThan(0);
      }
    });

    it("should have valid colors for each ninja", () => {
      for (const ninja of NINJAS) {
        expect(ninja.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe("DEFAULT_SETTINGS", () => {
    it("should have sensible defaults", () => {
      expect(DEFAULT_SETTINGS.maxNumber).toBe(10);
      expect(DEFAULT_SETTINGS.operators).toEqual(["+", "-"]);
      expect(DEFAULT_SETTINGS.disableIdleTimer).toBe(false);
    });
  });

  describe("findNinjaById", () => {
    it("should find ninja by id", () => {
      const kai = findNinjaById("kai");
      expect(kai.name).toBe("Kai");
    });

    it("should return first ninja for unknown id", () => {
      const fallback = findNinjaById("unknown");
      expect(fallback).toBe(NINJAS[0]);
    });
  });
});

// ============================================================================
// SMOKE TESTS - Persystencja (localStorage)
// ============================================================================

describe("Persistence (localStorage)", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => store[key] || null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      store[key] = value;
    });
  });

  it("should save and load game data", () => {
    const dataToSave = {
      highScore: 150,
      selectedNinjaId: "jay",
      gameSettings: {
        maxNumber: 20,
        operators: ["+", "-"] as ("+"|"-"|"*"|"/")[],
        disableIdleTimer: false,
      },
    };

    saveGameData(dataToSave);
    const loaded = loadGameData();

    expect(loaded).toEqual(dataToSave);
  });

  it("should return null when no saved data exists", () => {
    const loaded = loadGameData();
    expect(loaded).toBeNull();
  });

  it("should restore state from saved data", () => {
    saveGameData({
      highScore: 500,
      selectedNinjaId: "kai",
      gameSettings: {
        maxNumber: 30,
        operators: ["*", "/"],
        disableIdleTimer: true,
      },
    });

    const state = createInitialState();

    expect(state.highScore).toBe(500);
    expect(state.currentNinja.id).toBe("kai");
    expect(state.settings.maxNumber).toBe(30);
    expect(state.settings.operators).toEqual(["*", "/"]);
    expect(state.settings.disableIdleTimer).toBe(true);
  });
});

// ============================================================================
// TIMING TESTS - Problem transitions and rapid answers
// ============================================================================

describe("Problem Transitions (Timing)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate unique problems on consecutive answers", () => {
    let state = createInitialState();
    state = startGame(state);

    const problem1 = state.currentProblem!;
    expect(problem1).not.toBeNull();

    // Answer correctly
    const result1 = processAnswer(state, problem1.correctAnswer);
    state = result1.state;
    const problem2 = state.currentProblem!;

    // Problem should be different
    expect(problem2).not.toBeNull();
    const isSame =
      problem1.operand1 === problem2.operand1 &&
      problem1.operand2 === problem2.operand2 &&
      problem1.operator === problem2.operator;
    expect(isSame).toBe(false);
  });

  it("should handle rapid consecutive answers without losing state", () => {
    let state = createInitialState();
    state = startGame(state);

    const problems: (typeof state.currentProblem)[] = [state.currentProblem];

    // Simulate 5 rapid correct answers
    for (let i = 0; i < 5; i++) {
      const currentProblem = state.currentProblem!;
      const result = processAnswer(state, currentProblem.correctAnswer);
      state = result.state;
      problems.push(state.currentProblem);

      // Advance time by only 50ms (less than 150ms animation)
      vi.advanceTimersByTime(50);
    }

    // All problems should be stored (no nulls except if game ended)
    const validProblems = problems.filter((p) => p !== null);
    expect(validProblems.length).toBe(6); // Initial + 5 new ones

    // Score should reflect all correct answers
    expect(state.correctAnswers).toBe(5);
  });

  it("should track problem sequence correctly during rapid input", () => {
    let state = createInitialState();
    state = startGame(state);

    // Track the sequence of problems
    const problemSequence: string[] = [];

    const formatProblemKey = (p: typeof state.currentProblem) =>
      p ? `${p.operand1}${p.operator}${p.operand2}` : "null";

    problemSequence.push(formatProblemKey(state.currentProblem));

    // Answer 3 times rapidly
    for (let i = 0; i < 3; i++) {
      const result = processAnswer(state, state.currentProblem!.correctAnswer);
      state = result.state;
      problemSequence.push(formatProblemKey(state.currentProblem));
    }

    // Each problem in sequence should be unique
    const uniqueProblems = new Set(problemSequence);
    expect(uniqueProblems.size).toBe(problemSequence.length);
  });

  it("should maintain correct problem after animation timeout completes", () => {
    let state = createInitialState();
    state = startGame(state);

    const problem1 = state.currentProblem!;

    // Answer and capture the new problem immediately
    const result = processAnswer(state, problem1.correctAnswer);
    state = result.state;
    const problem2 = state.currentProblem!;

    // Advance past the 150ms animation delay
    vi.advanceTimersByTime(200);

    // State should still have problem2
    expect(state.currentProblem).toBe(problem2);
    expect(state.currentProblem).not.toBe(problem1);
  });

  it("should handle answer before animation completes then another answer", () => {
    let state = createInitialState();
    state = startGame(state);

    const problem1 = state.currentProblem!;

    // First answer
    state = processAnswer(state, problem1.correctAnswer).state;
    const problem2 = state.currentProblem!;

    // Only 50ms passes (animation not complete)
    vi.advanceTimersByTime(50);

    // Second answer before animation finishes
    state = processAnswer(state, problem2.correctAnswer).state;
    const problem3 = state.currentProblem!;

    // Now let all animations complete
    vi.advanceTimersByTime(300);

    // Final state should have problem3
    expect(state.currentProblem).toBe(problem3);

    // All three problems should be different
    expect(formatProblem(problem1)).not.toBe(formatProblem(problem2));
    expect(formatProblem(problem2)).not.toBe(formatProblem(problem3));
  });
});

// ============================================================================
// BUG INVESTIGATION: Visual same-problem after answer
// ============================================================================

describe("Bug Investigation: Same Visual Problem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formatProblem should produce different strings for different problems", () => {
    // This test checks if formatProblem can accidentally produce
    // the same visual string for two different internal problems
    const problem1: MathProblem = {
      operand1: 5,
      operand2: 3,
      operator: "+",
      correctAnswer: 8,
    };
    const problem2: MathProblem = {
      operand1: 6,
      operand2: 2,
      operator: "+",
      correctAnswer: 8,
    };

    expect(formatProblem(problem1)).toBe("5 + 3 = ?");
    expect(formatProblem(problem2)).toBe("6 + 2 = ?");
    expect(formatProblem(problem1)).not.toBe(formatProblem(problem2));
  });

  it("generateUniqueProblem should produce visually different problems", () => {
    const settings: GameSettings = {
      maxNumber: 10,
      operators: ["+"],
      disableIdleTimer: false,
    };

    // Run many trials to catch potential collisions
    for (let i = 0; i < 50; i++) {
      const problem1: MathProblem = {
        operand1: 2,
        operand2: 1,
        operator: "+",
        correctAnswer: 3,
      };
      const problem2 = generateUniqueProblem(settings, problem1);

      const formatted1 = formatProblem(problem1);
      const formatted2 = formatProblem(problem2);

      expect(formatted1).not.toBe(formatted2);
    }
  });

  it("consecutive processAnswer calls should never show same visual problem", () => {
    let state = createInitialState();
    state = startGame(state);

    const seenFormattedProblems: string[] = [];

    // Simulate 20 consecutive correct answers
    for (let i = 0; i < 20; i++) {
      const currentProblem = state.currentProblem!;
      const formattedCurrent = formatProblem(currentProblem);

      // Check this problem wasn't just shown
      if (seenFormattedProblems.length > 0) {
        const lastShown =
          seenFormattedProblems[seenFormattedProblems.length - 1];
        expect(formattedCurrent).not.toBe(lastShown);
      }

      seenFormattedProblems.push(formattedCurrent);

      // Answer correctly
      const result = processAnswer(state, currentProblem.correctAnswer);
      state = result.state;
    }
  });

  it("simulates rapid UI updates without race conditions", () => {
    // This simulates what main.ts does:
    // 1. processAnswer modifies state
    // 2. setTimeout(150ms) updates DOM
    // 3. User answers before timeout completes

    let state = createInitialState();
    state = startGame(state);

    // Track what the "DOM" would show
    let domProblemText = formatProblem(state.currentProblem!);
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

    const simulateAnswer = () => {
      const currentProblem = state.currentProblem!;
      const result = processAnswer(state, currentProblem.correctAnswer);
      state = result.state;

      // Cancel any pending animation (like main.ts does)
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }

      // Capture the new problem BEFORE setTimeout (like main.ts should do)
      const newProblem = state.currentProblem!;
      const previousDomText = domProblemText;

      // Schedule DOM update (simulating 150ms animation)
      pendingTimeout = setTimeout(() => {
        domProblemText = formatProblem(newProblem);
        pendingTimeout = null;

        // After update, DOM should show different problem
        expect(domProblemText).not.toBe(previousDomText);
      }, 150);
    };

    // Rapid answers - every 50ms (before animation completes)
    for (let i = 0; i < 5; i++) {
      simulateAnswer();
      vi.advanceTimersByTime(50); // Only 50ms between answers
    }

    // Let final animation complete
    vi.advanceTimersByTime(200);

    // Final DOM should show current state's problem
    expect(domProblemText).toBe(formatProblem(state.currentProblem!));
  });
});
// ============================================================================
// TESTS - Multiplication and Division
// ============================================================================

describe("Multiplication Problem Generation", () => {
  describe("generateMultiplicationProblem", () => {
    it("should create a valid multiplication problem", () => {
      const problem = generateMultiplicationProblem(100);

      expect(problem.operator).toBe("*");
      expect(problem.correctAnswer).toBe(problem.operand1 * problem.operand2);
    });

    it("should generate factors within reasonable range (max 10x10)", () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateMultiplicationProblem(100);

        expect(problem.operand1).toBeGreaterThanOrEqual(1);
        expect(problem.operand1).toBeLessThanOrEqual(10);
        expect(problem.operand2).toBeGreaterThanOrEqual(1);
        expect(problem.operand2).toBeLessThanOrEqual(10);
      }
    });

    it("should always produce positive results", () => {
      for (let i = 0; i < 50; i++) {
        const problem = generateMultiplicationProblem(50);
        expect(problem.correctAnswer).toBeGreaterThan(0);
      }
    });
  });
});

describe("Division Problem Generation", () => {
  describe("generateDivisionProblem", () => {
    it("should create a valid division problem", () => {
      const problem = generateDivisionProblem(100);

      expect(problem.operator).toBe("/");
      expect(problem.correctAnswer).toBe(problem.operand1 / problem.operand2);
    });

    it("should always produce whole number results (no remainder)", () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateDivisionProblem(100);

        // Result should be a whole number
        expect(Number.isInteger(problem.correctAnswer)).toBe(true);
        // Verify: dividend / divisor = quotient (no remainder)
        expect(problem.operand1 % problem.operand2).toBe(0);
      }
    });

    it("should never divide by zero", () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateDivisionProblem(50);
        expect(problem.operand2).toBeGreaterThan(0);
      }
    });

    it("should always produce positive results", () => {
      for (let i = 0; i < 50; i++) {
        const problem = generateDivisionProblem(50);
        expect(problem.correctAnswer).toBeGreaterThan(0);
      }
    });
  });
});

describe("formatProblem with new operators", () => {
  it("should format multiplication problem with × symbol", () => {
    const problem: MathProblem = {
      operand1: 5,
      operand2: 3,
      operator: "*",
      correctAnswer: 15,
    };

    expect(formatProblem(problem)).toBe("5 × 3 = ?");
  });

  it("should format division problem with ÷ symbol", () => {
    const problem: MathProblem = {
      operand1: 12,
      operand2: 4,
      operator: "/",
      correctAnswer: 3,
    };

    expect(formatProblem(problem)).toBe("12 ÷ 4 = ?");
  });
});

// ============================================================================
// TESTS - Game Settings
// ============================================================================

describe("Game Settings", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => store[key] || null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      store[key] = value;
    });
  });

  describe("DEFAULT_SETTINGS constant", () => {
    it("should have sensible defaults", () => {
      expect(DEFAULT_SETTINGS.maxNumber).toBe(10);
      expect(DEFAULT_SETTINGS.operators).toEqual(["+", "-"]);
      expect(DEFAULT_SETTINGS.disableIdleTimer).toBe(false);
    });
  });

  describe("generateProblem with different settings", () => {
    it("should generate multiplication problems when configured", () => {
      const settings: GameSettings = {
        maxNumber: 100,
        operators: ["*"],
        disableIdleTimer: false,
      };

      for (let i = 0; i < 20; i++) {
        const problem = generateProblem(settings);
        expect(problem.operator).toBe("*");
      }
    });

    it("should generate division problems when configured", () => {
      const settings: GameSettings = {
        maxNumber: 100,
        operators: ["/"],
        disableIdleTimer: false,
      };

      for (let i = 0; i < 20; i++) {
        const problem = generateProblem(settings);
        expect(problem.operator).toBe("/");
      }
    });

    it("should generate mixed problems when all operators configured", () => {
      const settings: GameSettings = {
        maxNumber: 100,
        operators: ["+", "-", "*", "/"],
        disableIdleTimer: false,
      };

      const operators = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem(settings);
        operators.add(problem.operator);
      }

      // Should eventually generate all 4 operator types
      expect(operators.size).toBe(4);
      expect(operators.has("+")).toBe(true);
      expect(operators.has("-")).toBe(true);
      expect(operators.has("*")).toBe(true);
      expect(operators.has("/")).toBe(true);
    });
  });

  describe("applySettings", () => {
    it("should update settings in game state", () => {
      const state = createInitialState();
      const newSettings: GameSettings = {
        maxNumber: 50,
        operators: ["*"],
        disableIdleTimer: true,
      };

      const newState = applySettings(state, newSettings);

      expect(newState.settings.maxNumber).toBe(50);
      expect(newState.settings.operators).toEqual(["*"]);
      expect(newState.settings.disableIdleTimer).toBe(true);
    });
  });

  describe("Game flow with custom settings", () => {
    it("should play a complete round with multiplication settings", () => {
      let state = createInitialState();
      
      // Apply custom settings with only multiplication
      state = applySettings(state, {
        maxNumber: 50,
        operators: ["*"],
        disableIdleTimer: true,
      });
      
      state = startGame(state);

      // First problem should be multiplication
      expect(state.currentProblem).not.toBeNull();
      expect(state.currentProblem!.operator).toBe("*");

      // Answer correctly
      const correctAnswer = state.currentProblem!.correctAnswer;
      const result = processAnswer(state, correctAnswer);

      expect(result.isCorrect).toBe(true);
      expect(result.state.score).toBeGreaterThan(0);

      // Next problem should also be multiplication
      expect(result.state.currentProblem).not.toBeNull();
      expect(result.state.currentProblem!.operator).toBe("*");
    });

    it("should play with division and verify integer results", () => {
      let state = createInitialState();
      
      // Apply division-only settings
      state = applySettings(state, {
        maxNumber: 100,
        operators: ["/"],
        disableIdleTimer: false,
      });
      
      state = startGame(state);

      // Play 5 rounds
      for (let i = 0; i < 5; i++) {
        const problem = state.currentProblem!;
        expect(problem.operator).toBe("/");
        expect(Number.isInteger(problem.correctAnswer)).toBe(true);

        const result = processAnswer(state, problem.correctAnswer);
        state = result.state;
        expect(result.isCorrect).toBe(true);
      }
    });
  });
});

// ============================================================================
// Story Path System Tests
// ============================================================================

describe("Story Path System", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("STORY_PATHS constant", () => {
    it("should have 4 story paths", () => {
      expect(STORY_PATHS).toHaveLength(4);
    });

    it("should have unique IDs", () => {
      const ids = STORY_PATHS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(STORY_PATHS.length);
    });

    it("should have non-empty bossOrder arrays", () => {
      for (const path of STORY_PATHS) {
        expect(path.bossOrder.length).toBeGreaterThan(0);
      }
    });

    it("should have valid boss IDs in bossOrder", () => {
      const validBossIds = ENEMY_TYPES.filter(
        (e) => e.isBoss && e.id !== "overlord"
      ).map((e) => e.id);

      for (const path of STORY_PATHS) {
        for (const bossId of path.bossOrder) {
          expect(validBossIds).toContain(bossId);
        }
      }
    });

    it("should include classic path", () => {
      const classicPath = STORY_PATHS.find((p) => p.id === "classic");
      expect(classicPath).toBeDefined();
    });
  });

  describe("findStoryPathById", () => {
    it("should find existing path by ID", () => {
      const path = findStoryPathById("serpentine");
      expect(path.id).toBe("serpentine");
    });

    it("should return classic path for unknown ID", () => {
      const path = findStoryPathById("unknown" as StoryPathId);
      expect(path.id).toBe("classic");
    });
  });

  describe("getDefaultStoryPath", () => {
    it("should return classic path", () => {
      const path = getDefaultStoryPath();
      expect(path.id).toBe("classic");
    });
  });

  describe("getRandomStoryPath", () => {
    it("should return a valid story path", () => {
      const path = getRandomStoryPath();
      expect(STORY_PATHS).toContain(path);
    });

    it("should return different paths over many calls (randomness test)", () => {
      const pathIds = new Set<StoryPathId>();
      for (let i = 0; i < 100; i++) {
        pathIds.add(getRandomStoryPath().id);
      }
      // With 100 calls and 4 paths, we should see at least 2 different paths
      expect(pathIds.size).toBeGreaterThan(1);
    });
  });

  describe("findEnemyById", () => {
    it("should find skeleton enemy", () => {
      const enemy = findEnemyById("skeleton");
      expect(enemy.id).toBe("skeleton");
      expect(enemy.isBoss).toBe(false);
    });

    it("should find overlord boss", () => {
      const enemy = findEnemyById("overlord");
      expect(enemy.id).toBe("overlord");
      expect(enemy.isBoss).toBe(true);
    });

    it("should return first enemy for unknown ID (with warning)", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const enemy = findEnemyById("unknown-enemy-id");
      expect(enemy).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getEnemyType with storyPath", () => {
    it("should return regular enemy for levels 1-4", () => {
      const regularEnemies = ENEMY_TYPES.filter((e) => !e.isBoss);
      const regularIds = regularEnemies.map((e) => e.id);

      for (let level = 1; level <= 4; level++) {
        const enemy = getEnemyType(level);
        expect(regularIds).toContain(enemy.id);
        expect(enemy.isBoss).toBe(false);
      }
    });

    it("should return first boss from path at level 5", () => {
      const classicPath = findStoryPathById("classic");
      const enemy = getEnemyType(5, classicPath);
      expect(enemy.id).toBe(classicPath.bossOrder[0]);
    });

    it("should return second boss from path at level 6", () => {
      const classicPath = findStoryPathById("classic");
      const enemy = getEnemyType(6, classicPath);
      expect(enemy.id).toBe(classicPath.bossOrder[1]);
    });

    it("should return Overlord for levels beyond bossOrder", () => {
      const classicPath = findStoryPathById("classic");
      const maxBossLevel = 5 + classicPath.bossOrder.length;
      const enemy = getEnemyType(maxBossLevel + 1, classicPath);
      expect(enemy.id).toBe("overlord");
    });

    it("should use classic path as fallback when no path provided", () => {
      const classicPath = findStoryPathById("classic");
      const enemyWithPath = getEnemyType(5, classicPath);
      const enemyWithoutPath = getEnemyType(5);
      // Both should return first boss of classic path
      expect(enemyWithPath.id).toBe(enemyWithoutPath.id);
    });

    it("should follow serpentine path correctly", () => {
      const serpentinePath = findStoryPathById("serpentine");
      const enemy = getEnemyType(5, serpentinePath);
      expect(enemy.id).toBe("serpentine"); // First boss in serpentine path
    });
  });

  describe("getEnemyHealthForType", () => {
    it("should calculate health based on enemy scale", () => {
      const skeleton = findEnemyById("skeleton");
      const overlord = findEnemyById("overlord");

      const skeletonHealth = getEnemyHealthForType(1, skeleton);
      const overlordHealth = getEnemyHealthForType(1, overlord);

      expect(overlordHealth).toBeGreaterThan(skeletonHealth);
    });

    it("should increase health with level", () => {
      const skeleton = findEnemyById("skeleton");
      const health1 = getEnemyHealthForType(1, skeleton);
      const health5 = getEnemyHealthForType(5, skeleton);

      expect(health5).toBeGreaterThan(health1);
    });

    it("should be deterministic (same inputs = same output)", () => {
      const skeleton = findEnemyById("skeleton");
      const health1 = getEnemyHealthForType(3, skeleton);
      const health2 = getEnemyHealthForType(3, skeleton);

      expect(health1).toBe(health2);
    });
  });

  describe("GameState with storyPath", () => {
    it("should include storyPath in initial state", () => {
      const state = createInitialState();
      expect(state.storyPath).toBeDefined();
      expect(STORY_PATHS).toContain(state.storyPath);
    });

    it("should include currentEnemy in initial state", () => {
      const state = createInitialState();
      expect(state.currentEnemy).toBeDefined();
      expect(state.currentEnemy.id).toBeDefined();
    });

    it("should get new storyPath on startGame", () => {
      const state1 = createInitialState();
      const originalPath = state1.storyPath;

      // Start game many times - at least one should have different path
      let foundDifferent = false;
      for (let i = 0; i < 50; i++) {
        const state2 = startGame(state1);
        if (state2.storyPath.id !== originalPath.id) {
          foundDifferent = true;
          break;
        }
      }
      // With 50 tries and 4 paths, probability of all same is (1/4)^50 ≈ 0
      expect(foundDifferent).toBe(true);
    });

    it("should update currentEnemy when enemy is defeated", () => {
      let state = createInitialState();
      state = startGame(state);

      // Defeat enemy by reducing health to 0
      state = {
        ...state,
        enemyHealth: 1,
      };

      const result = processAnswer(state, state.currentProblem!.correctAnswer);

      if (result.enemyDefeated) {
        // currentEnemy should be updated in state
        expect(result.state.currentEnemy).toBeDefined();
        expect(result.state.enemyLevel).toBe(state.enemyLevel + 1);
      }
    });
  });

  describe("storyPath persistence", () => {
    it("should save storyPathId to localStorage", () => {
      let state = createInitialState();
      state = startGame(state);

      // Trigger save by answering correctly
      processAnswer(state, state.currentProblem!.correctAnswer);

      const savedData = loadGameData();
      expect(savedData?.storyPathId).toBe(state.storyPath.id);
    });

    it("should restore storyPath from localStorage", () => {
      // Save specific path
      saveGameData({
        highScore: 100,
        selectedNinjaId: "kai",
        gameSettings: DEFAULT_SETTINGS,
        storyPathId: "serpentine",
      });

      const state = createInitialState();
      expect(state.storyPath.id).toBe("serpentine");
    });

    it("should use random path when no saved storyPathId", () => {
      saveGameData({
        highScore: 100,
        selectedNinjaId: "kai",
        gameSettings: DEFAULT_SETTINGS,
        // No storyPathId
      });

      const state = createInitialState();
      // Should still have a valid path
      expect(STORY_PATHS).toContain(state.storyPath);
    });
  });

  describe("ENEMY_TYPES validation", () => {
    it("should have regular enemies (non-bosses)", () => {
      const regularEnemies = ENEMY_TYPES.filter((e) => !e.isBoss);
      expect(regularEnemies.length).toBeGreaterThan(0);
    });

    it("should have boss enemies", () => {
      const bosses = ENEMY_TYPES.filter((e) => e.isBoss);
      expect(bosses.length).toBeGreaterThan(0);
    });

    it("should have overlord as final boss", () => {
      const overlord = ENEMY_TYPES.find((e) => e.id === "overlord");
      expect(overlord).toBeDefined();
      expect(overlord?.isBoss).toBe(true);
      expect(overlord?.scale).toBe(2.0); // Biggest enemy
    });

    it("should have unique enemy IDs", () => {
      const ids = ENEMY_TYPES.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ENEMY_TYPES.length);
    });

    it("should have all required properties for each enemy", () => {
      for (const enemy of ENEMY_TYPES) {
        expect(enemy.id).toBeDefined();
        expect(enemy.name).toBeDefined();
        expect(enemy.emoji).toBeDefined();
        expect(enemy.color).toBeDefined();
        expect(typeof enemy.scale).toBe("number");
        expect(typeof enemy.isBoss).toBe("boolean");
      }
    });
  });

  describe("COMBAT_CONFIG constants", () => {
    it("should have BOSS_LEVEL_OFFSET defined", () => {
      expect(COMBAT_CONFIG.BOSS_LEVEL_OFFSET).toBeDefined();
      expect(typeof COMBAT_CONFIG.BOSS_LEVEL_OFFSET).toBe("number");
    });

    it("should have SKELETON_REPEATS defined", () => {
      expect(COMBAT_CONFIG.SKELETON_REPEATS).toBeDefined();
      expect(typeof COMBAT_CONFIG.SKELETON_REPEATS).toBe("number");
    });

    it("boss level calculation should be consistent", () => {
      // Level 5 should be boss index 0
      // Formula: bossIndex = level - SKELETON_REPEATS - BOSS_LEVEL_OFFSET
      const bossIndex =
        5 - COMBAT_CONFIG.SKELETON_REPEATS - COMBAT_CONFIG.BOSS_LEVEL_OFFSET;
      expect(bossIndex).toBe(0);
    });
  });

  describe("Victory condition", () => {
    it("should set isVictory when Overlord is defeated", () => {
      let state = createInitialState();
      state = startGame(state);

      // Set up state with Overlord as current enemy at 1 HP
      state = {
        ...state,
        currentEnemy: findEnemyById("overlord"),
        enemyHealth: 1,
      };

      const result = processAnswer(state, state.currentProblem!.correctAnswer);

      expect(result.isVictory).toBe(true);
      expect(result.state.isVictory).toBe(true);
      expect(result.state.isGameOver).toBe(true);
      expect(result.newEnemyType).toBeNull(); // No new enemy after victory
    });

    it("should award bonus points for defeating Overlord", () => {
      let state = createInitialState();
      state = startGame(state);

      const initialScore = state.score;

      // Set up state with Overlord at 1 HP
      state = {
        ...state,
        currentEnemy: findEnemyById("overlord"),
        enemyHealth: 1,
      };

      const result = processAnswer(state, state.currentProblem!.correctAnswer);

      // Should get regular points + streak + 500 bonus for Overlord
      expect(result.state.score).toBeGreaterThan(initialScore + 500);
    });

    it("should not process answers after victory", () => {
      let state = createInitialState();
      state = startGame(state);
      state = { ...state, isVictory: true, isGameOver: true };

      const result = processAnswer(state, 42);

      expect(result.isCorrect).toBe(false);
      expect(result.state).toBe(state); // State unchanged
    });
  });

  describe("Input sanitization", () => {
    it("should treat NaN as wrong answer", () => {
      let state = createInitialState();
      state = startGame(state);

      const result = processAnswer(state, NaN);

      expect(result.isCorrect).toBe(false);
      expect(result.enemyAttacked).toBe(true);
    });

    it("should treat Infinity as wrong answer", () => {
      let state = createInitialState();
      state = startGame(state);

      const result = processAnswer(state, Infinity);

      expect(result.isCorrect).toBe(false);
      expect(result.enemyAttacked).toBe(true);
    });

    it("should treat -Infinity as wrong answer", () => {
      let state = createInitialState();
      state = startGame(state);

      const result = processAnswer(state, -Infinity);

      expect(result.isCorrect).toBe(false);
      expect(result.enemyAttacked).toBe(true);
    });
  });

  describe("localStorage validation", () => {
    it("should return null for corrupted highScore", () => {
      localStorage.setItem(
        "ninjago-math-game-save",
        JSON.stringify({
          highScore: "not a number",
          selectedNinjaId: "kai",
          selectedDifficultyId: "easy",
        })
      );

      const result = loadGameData();
      expect(result).toBeNull();
    });

    it("should return null for missing required fields", () => {
      localStorage.setItem(
        "ninjago-math-game-save",
        JSON.stringify({
          highScore: 100,
          // missing selectedNinjaId and selectedDifficultyId
        })
      );

      const result = loadGameData();
      expect(result).toBeNull();
    });

    it("should strip corrupted gameSettings", () => {
      localStorage.setItem(
        "ninjago-math-game-save",
        JSON.stringify({
          highScore: 100,
          selectedNinjaId: "kai",
          gameSettings: {
            maxNumber: "not a number",
            operators: "+", // should be array
            disableIdleTimer: "yes", // should be boolean
          },
        })
      );

      const result = loadGameData();
      expect(result).not.toBeNull();
      // Should have default settings since original was corrupted
      expect(result?.gameSettings.maxNumber).toBe(10);
      expect(result?.gameSettings.operators).toEqual(["+", "-"]);
    });

    it("should handle valid save data", () => {
      localStorage.setItem(
        "ninjago-math-game-save",
        JSON.stringify({
          highScore: 500,
          selectedNinjaId: "kai",
          storyPathId: "serpentine",
          gameSettings: {
            maxNumber: 50,
            operators: ["*", "/"],
            disableIdleTimer: true,
          },
        })
      );

      const result = loadGameData();
      expect(result).not.toBeNull();
      expect(result?.highScore).toBe(500);
      expect(result?.storyPathId).toBe("serpentine");
      expect(result?.gameSettings?.maxNumber).toBe(50);
    });
  });
});
