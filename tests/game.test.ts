/**
 * Ninjago Math Game - Smoke Tests
 *
 * Podstawowe testy integracyjne sprawdzające poprawność działania gry.
 * Przygotowane pod kątem dalszego rozwoju - łatwe do rozszerzenia.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MathProblem, DifficultyConfig } from "../src/game";
import {
  // Stałe
  NINJAS,
  DIFFICULTIES,

  // Funkcje generowania zadań
  generateAdditionProblem,
  generateSubtractionProblem,
  generateProblem,
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

    it("should always produce non-negative results (child-friendly)", () => {
      // Test wielokrotnie dla losowości
      for (let i = 0; i < 100; i++) {
        const problem = generateSubtractionProblem(50);

        expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(problem.operand1).toBeGreaterThanOrEqual(problem.operand2);
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
      };

      const problem = generateProblem(easyDifficulty);
      expect(problem.operator).toBe("+");
    });

    it("should respect difficulty operators", () => {
      const addOnlyDifficulty = DIFFICULTIES[0]; // Łatwy - tylko dodawanie

      for (let i = 0; i < 50; i++) {
        const problem = generateProblem(addOnlyDifficulty);
        expect(problem.operator).toBe("+");
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

    it("should have Lloyd as default ninja", () => {
      const state = createInitialState();
      expect(state.currentNinja.id).toBe("lloyd");
    });

    it("should have easy as default difficulty", () => {
      const state = createInitialState();
      expect(state.difficulty.id).toBe("easy");
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
      expect(newState.difficulty.maxNumber).toBe(50);
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
    it("should have 4 difficulty levels", () => {
      expect(DIFFICULTIES).toHaveLength(4);
    });

    it("should have increasing maxNumber", () => {
      const maxNumbers = DIFFICULTIES.map((d) => d.maxNumber);

      for (let i = 1; i < maxNumbers.length; i++) {
        expect(maxNumbers[i]).toBeGreaterThan(maxNumbers[i - 1]);
      }
    });

    it("should have easy level with only addition", () => {
      const easy = DIFFICULTIES.find((d) => d.id === "easy");
      expect(easy?.operators).toEqual(["+"]);
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

  it("should restore state from saved data", () => {
    saveGameData({
      highScore: 500,
      selectedNinjaId: "nya",
      selectedDifficultyId: "master",
    });

    const state = createInitialState();

    expect(state.highScore).toBe(500);
    expect(state.currentNinja.id).toBe("nya");
    expect(state.difficulty.id).toBe("master");
  });
});
