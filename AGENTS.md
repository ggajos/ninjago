# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in the Ninjago Math Game repository.

## Project Overview

Educational math game for children with a Ninjago theme. Built with TypeScript, Vite, and Vitest. 
Targets web browsers, optimized for mobile devices with custom keyboard and haptic feedback.

## Build, Test, and Run Commands

```bash
# Development
npm run dev              # Start Vite dev server (hot reload)
npm run build            # TypeScript compile + Vite build to dist/
npm run preview          # Preview production build locally

# Testing
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with v8 coverage

# Running a single test file
npm test -- tests/game.test.ts

# Running tests matching a pattern
npm test -- -t "generateAdditionProblem"
npm test -- -t "Math Problem Generation"

# Deployment
npm run deploy           # Build and deploy to GitHub Pages
```

## Project Structure

```
nijnjago/
├── src/
│   ├── main.ts         # UI, DOM manipulation, event handlers, rendering
│   ├── game.ts         # Pure game logic, types, constants, state management
│   ├── sounds.ts       # Web Audio API procedural sound generation
│   ├── style.css       # CSS with variables, animations, responsive design
│   └── vite-env.d.ts   # Vite type definitions
├── tests/
│   └── game.test.ts    # Unit tests (Vitest)
├── index.html          # Main HTML with all UI elements
├── Agent.md            # Detailed game documentation (Polish)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite + Vitest configuration
```

## Code Style Guidelines

### TypeScript Configuration

The project uses strict TypeScript (ES2022 target) with these enforced rules:
- `strict: true` - All strict type checks enabled
- `noUnusedLocals: true` - No unused local variables
- `noUnusedParameters: true` - No unused function parameters
- `noFallthroughCasesInSwitch: true` - Explicit case handling in switch statements
- `verbatimModuleSyntax: true` - Use `import type` for type-only imports

### Import Style

```typescript
// Type imports MUST use 'import type'
import type { GameState, EnemyType, MathOperator } from "./game";

// Regular imports for values and functions
import { NINJAS, DIFFICULTIES, createInitialState } from "./game";
import { playSound, getMuted, toggleMuted } from "./sounds";

// CSS imports for Vite bundling
import "./style.css";
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | camelCase.ts | `game.ts`, `sounds.ts` |
| Test files | *.test.ts | `game.test.ts` |
| Interfaces | PascalCase | `GameState`, `MathProblem` |
| Type aliases | PascalCase | `MathOperator`, `StoryPathId` |
| Constants | UPPER_SNAKE_CASE | `NINJAS`, `COMBAT_CONFIG` |
| Functions | camelCase | `generateProblem`, `processAnswer` |
| Variables | camelCase | `currentNinja`, `enemyHealth` |

### Code Organization

Use clear section separators in larger files:

```typescript
// ============================================================================
// SECTION NAME
// ============================================================================
```

### Function Documentation

Use JSDoc comments for exported functions:

```typescript
/**
 * Generuje zadanie dodawania.
 * Suma nie przekracza maxNumber i jest zawsze > 0.
 */
export function generateAdditionProblem(maxNumber: number): MathProblem {
  // implementation
}
```

### Error Handling Patterns

```typescript
// Try-catch for external APIs (localStorage, Web Audio)
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch {
  console.warn("Nie mozna zapisac danych gry");
}

// Fallback pattern for lookups
export function findNinjaById(id: string): NinjaCharacter {
  const ninja = NINJAS.find((n) => n.id === id);
  if (!ninja) {
    console.warn(`Ninja "${id}" not found, falling back to ${NINJAS[0].id}`);
    return NINJAS[0];
  }
  return ninja;
}

// Input sanitization
const sanitizedAnswer = Number.isFinite(userAnswer) ? userAnswer : NaN;
```

### State Management

- Use immutable state updates with spread operator
- Keep game logic as pure functions in `game.ts`
- UI logic and DOM manipulation stays in `main.ts`
- State is persisted to localStorage

```typescript
// Immutable state update pattern
return {
  ...state,
  score: state.score + points,
  streak: state.streak + 1,
};
```

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { MathProblem } from "../src/game";
import { generateAdditionProblem, NINJAS } from "../src/game";

describe("Feature Category", () => {
  describe("specificFunction", () => {
    it("should do something specific", () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Testing Randomness

Test random functions with multiple iterations:

```typescript
it("should always produce positive results", () => {
  for (let i = 0; i < 100; i++) {
    const problem = generateSubtractionProblem(50);
    expect(problem.correctAnswer).toBeGreaterThan(0);
  }
});
```

### Mocking

```typescript
// Mock localStorage
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Fake timers
vi.useFakeTimers();
vi.advanceTimersByTime(15000);
vi.useRealTimers();
```

## Language Notes

- **Code comments**: Polish
- **User-facing strings**: Polish  
- **Function/variable names**: English
- **Documentation**: Polish (Agent.md) / English (AGENTS.md)

## Key Constants Reference

Located in `src/game.ts`:

- `NINJAS[]` - 6 ninja characters (kai, jay, cole, zane, lloyd, nya)
- `DIFFICULTIES[]` - 4 difficulty levels (easy/10, medium/20, hard/50, master/100)
- `ENEMY_TYPES[]` - 9 enemy types (skeleton to overlord)
- `COMBAT_CONFIG` - Combat parameters (damage, health, timeouts)

## DOM Structure

Key screens: `#start-screen`, `#ninja-select`, `#difficulty-select`, `#game-screen`, `#gameover-screen`

Key elements:
- `.battle-arena` - Fight area with ninja and enemy
- `#ninja-avatar`, `#enemy-avatar` - SVG avatars
- `#player-health-fill`, `#enemy-health-fill` - Health bars
- `.numpad` - Custom numeric keyboard (prevents native keyboard)
- `#idle-timer` - Inactivity timer bar

## Important Implementation Notes

1. Custom keyboard uses `inputmode="none"` to prevent native keyboard
2. Idle timer (15s default) triggers enemy attack on inactivity
3. New questions appear instantly after answering
4. Base path is `/ninjago/` for GitHub Pages deployment
5. Sounds are procedurally generated via Web Audio API (no audio files)
6. Health regenerates (+5 HP) on correct answers
7. Streak bonus adds +3 damage per consecutive correct answer (max 5)
