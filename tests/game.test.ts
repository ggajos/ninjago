/**
 * Ninjago Math Game - Smoke Tests
 *
 * Podstawowe testy integracyjne sprawdzające poprawność działania gry.
 * Przygotowane pod kątem dalszego rozwoju - łatwe do rozszerzenia.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { MathProblem, DifficultyConfig } from "../src/game";
import {
  // Stałe
  NINJAS,
  DIFFICULTIES,

  // Funkcje generowania zadań
  generateAdditionProblem,
  generateSubtractionProblem,
  generateProblem,
  generateUniqueProblem,
  checkAnswer,
  formatProblem,

  // Funkcje stanu gry
  createInitialState,
  startGame,
  processAnswer,
  selectNinja,
  selectDifficulty,

  // Persystencja
  saveGameData,
  loadGameData,
  findNinjaById,
  findDifficultyById,
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
    it("should generate problems based on difficulty config", () => {
      const easyDifficulty: DifficultyConfig = {
        id: "easy",
        name: "Easy",
        namePolish: "Łatwy",
        maxNumber: 10,
        operators: ["+"],
        description: "Tylko dodawanie",
        disableIdleTimer: false,
      };

      const problem = generateProblem(easyDifficulty);
      expect(problem.operator).toBe("+");
    });

    it("should respect difficulty operators", () => {
      const easyDifficulty = DIFFICULTIES[0]; // Łatwy - dodawanie i odejmowanie

      for (let i = 0; i < 50; i++) {
        const problem = generateProblem(easyDifficulty);
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
      expect(state.difficulty).toBeDefined();
    });

    it("should have Nya as default ninja (very-easy difficulty)", () => {
      const state = createInitialState();
      expect(state.currentNinja.id).toBe("nya");
    });

    it("should have very-easy as default difficulty", () => {
      const state = createInitialState();
      expect(state.difficulty.id).toBe("very-easy");
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

  describe("selectDifficulty", () => {
    it("should change difficulty", () => {
      const state = createInitialState();
      const newState = selectDifficulty(state, "hard");

      expect(newState.difficulty.id).toBe("hard");
      expect(newState.difficulty.maxNumber).toBe(35);
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

  describe("DIFFICULTIES", () => {
    it("should have 6 difficulty levels", () => {
      expect(DIFFICULTIES).toHaveLength(6);
    });

    it("should have increasing maxNumber", () => {
      const maxNumbers = DIFFICULTIES.map((d) => d.maxNumber);

      for (let i = 1; i < maxNumbers.length; i++) {
        expect(maxNumbers[i]).toBeGreaterThan(maxNumbers[i - 1]);
      }
    });

    it("should have easy level with addition and subtraction", () => {
      const easy = DIFFICULTIES.find((d) => d.id === "easy");
      expect(easy?.operators).toEqual(["+", "-"]);
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

  describe("findDifficultyById", () => {
    it("should find difficulty by id", () => {
      const hard = findDifficultyById("hard");
      expect(hard.namePolish).toBe("Trudny");
    });

    it("should return first difficulty for unknown id", () => {
      const fallback = findDifficultyById("unknown");
      expect(fallback).toBe(DIFFICULTIES[0]);
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
      selectedDifficultyId: "medium",
    };

    saveGameData(dataToSave);
    const loaded = loadGameData();

    expect(loaded).toEqual(dataToSave);
  });

  it("should return null when no saved data exists", () => {
    const loaded = loadGameData();
    expect(loaded).toBeNull();
  });

  it("should restore state from saved data (ninja auto-selected by difficulty)", () => {
    saveGameData({
      highScore: 500,
      selectedNinjaId: "kai", // This is ignored - ninja is auto-selected by difficulty
      selectedDifficultyId: "master",
    });

    const state = createInitialState();

    expect(state.highScore).toBe(500);
    // Ninja is auto-selected based on difficulty (master -> lloyd)
    expect(state.currentNinja.id).toBe("lloyd");
    expect(state.difficulty.id).toBe("master");
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
    const difficulty = DIFFICULTIES.find((d) => d.id === "very-easy")!;

    // Run many trials to catch potential collisions
    for (let i = 0; i < 50; i++) {
      const problem1: MathProblem = {
        operand1: 2,
        operand2: 1,
        operator: "+",
        correctAnswer: 3,
      };
      const problem2 = generateUniqueProblem(difficulty, problem1);

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
