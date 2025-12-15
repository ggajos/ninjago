# Ninjago Math Game - Dokumentacja Projektu

## 📋 Opis

Edukacyjna gra matematyczna dla dzieci w świecie Ninjago. Dzieci uczą się dodawania i odejmowania walcząc z wrogami jako ninja.

## 🎮 Główne funkcje

1. **System walki** - odpowiadanie na pytania matematyczne = atakowanie wroga
2. **Progresja wrogów** - od szkieletów do bossów (Overlord)
3. **6 postaci ninja** - każda z własnym elementem i zachętami
4. **4 poziomy trudności** - od 10 do 100
5. **System combo/streak** - bonus za serie poprawnych odpowiedzi
6. **Idle attack** - wróg atakuje po 15s nieaktywności
7. **Custom keyboard** - klawiatura numeryczna dla dzieci (bez natywnej klawiatury)
8. **Dźwięki** - Web Audio API (proceduralne, bez plików)
9. **Deploy** - GitHub Pages

## 📁 Struktura plików

```
nijnjago/
├── index.html          # Główny HTML z layoutem gry
├── package.json        # Zależności: vite, vitest, typescript, gh-pages
├── tsconfig.json       # Konfiguracja TypeScript
├── vite.config.ts      # Vite config z base: /ninjago/
├── Agent.md            # Ten plik - dokumentacja dla AI
│
├── src/
│   ├── main.ts         # UI, DOM, event handlers, renderowanie
│   ├── game.ts         # Logika gry, typy, stałe, stan
│   ├── sounds.ts       # System dźwięków (Web Audio API)
│   ├── style.css       # Style, animacje, responsywność
│   └── vite-env.d.ts   # Typy Vite
│
├── tests/
│   └── game.test.ts    # Testy jednostkowe (vitest)
│
└── dist/               # Build output (generowany)
```

## 🔧 Kluczowe pliki

### `src/game.ts` - Logika gry

**Typy:**

- `MathProblem` - zadanie matematyczne
- `NinjaCharacter` - postać ninja (id, name, element, color, emoji, encouragements, comforts)
- `DifficultyConfig` - poziom trudności (maxNumber, operators)
- `GameState` - stan gry (score, health, streak, enemyLevel, etc.)
- `EnemyType` - typ wroga (id, name, emoji, scale, isBoss)
- `SavedData` - dane w localStorage

**Stałe:**

- `NINJAS[]` - 6 ninja (kai, jay, cole, zane, lloyd, nya)
- `DIFFICULTIES[]` - 4 poziomy (easy/10, medium/20, hard/50, master/100)
- `COMBAT_CONFIG` - konfiguracja walki:
  - `PLAYER_MAX_HEALTH: 100`
  - `ENEMY_BASE_HEALTH: 100`
  - `ENEMY_HEALTH_INCREMENT: 20`
  - `PLAYER_ATTACK_DAMAGE: 15`
  - `ENEMY_ATTACK_DAMAGE: 20`
  - `IDLE_ATTACK_DAMAGE: 10`
  - `IDLE_TIMEOUT_MS: 15000` (15 sekund)
  - `HEALTH_REGEN_ON_HIT: 5`
  - `STREAK_BONUS_DAMAGE: 3`
  - `SKELETON_REPEATS: 3`
- `ENEMY_TYPES[]` - 9 typów wrogów (skeleton → overlord)

**Funkcje:**

- `generateProblem()` - generuje zadanie
- `processAnswer()` - przetwarza odpowiedź, zwraca wynik walki
- `processIdleAttack()` - atak wroga przy nieaktywności
- `getEnemyType(level)` - zwraca typ wroga dla poziomu
- `getEnemyHealth(level)` - oblicza HP wroga
- `createInitialState()` / `startGame()` - inicjalizacja

### `src/main.ts` - UI i renderowanie

**Ekrany:**

- `#start-screen` - menu główne
- `#ninja-select` - wybór ninja
- `#difficulty-select` - wybór trudności
- `#game-screen` - ekran gry
- `#gameover-screen` - game over

**Kluczowe elementy DOM:**

- `.battle-arena` - arena walki z ninja i wrogiem
- `#ninja-avatar`, `#enemy-avatar` - SVG avatary
- `#player-health-fill`, `#enemy-health-fill` - paski HP
- `#enemy-name` - nazwa wroga z emoji
- `#problem-display` - wyświetlanie zadania
- `#answer-display` - wyświetlanie odpowiedzi
- `.numpad` - custom klawiatura numeryczna
- `#idle-timer` - pasek czasu nieaktywności

**Funkcje renderowania:**

- `createNinjaAvatarSVG(ninja, size)` - generuje SVG ninja
- `createEnemyAvatarSVG(enemy, size)` - generuje SVG wroga (różne dla każdego typu)
- `updateHealthBars()` - aktualizuje paski HP
- `updateEnemyNameDisplay(enemy)` - aktualizuje nazwę wroga
- `showDamagePopup()` - popup z obrażeniami
- `showFeedback()` - feedback po odpowiedzi

**Custom Keyboard:**

- `.numpad` - przyciski 0-9
- `#backspace-btn` - usuwanie
- `#attack-btn` - atak/submit
- Input ma `inputmode="none"` żeby nie pokazywać natywnej klawiatury

### `src/sounds.ts` - Dźwięki

**Web Audio API** - proceduralne dźwięki bez plików:

- `correct` - poprawna odpowiedź
- `wrong` - błędna odpowiedź
- `attack` - atak gracza
- `hit` - trafienie
- `victory` - pokonanie wroga
- `gameOver` - przegrana
- `click` - kliknięcie
- `start` - start gry

**Funkcje:**

- `playSound(type)` - odtwarza dźwięk
- `getMuted()` / `toggleMuted()` - wyciszenie

### `src/style.css` - Style

**Sekcje:**

- Zmienne CSS (--ninja-kai, --font-display, etc.)
- Layout ekranów
- Battle arena i avatary
- Paski zdrowia z animacjami
- Custom keyboard (fixed na dole)
- Animacje (idle, attack, spawn, damage)
- Responsywność (@media)

**Kluczowe klasy:**

- `.fighter-player`, `.fighter-enemy` - kontenery walczących
- `.health-bar`, `.health-fill` - paski HP
- `.enemy-spawn` - animacja spawn nowego wroga
- `.boss-name` - pulsujący styl dla bossów
- `.attacking`, `.hit` - animacje walki

### `index.html` - Layout

**Struktura:**

```html
<div id="start-screen">...</div>
<div id="ninja-select">...</div>
<div id="difficulty-select">...</div>
<div id="game-screen">
  <header>score, streak, back, mute</header>
  <main>
    <div class="battle-arena">
      <div class="fighter-player">ninja + HP</div>
      <div class="battle-center">efekty</div>
      <div class="fighter-enemy">enemy + HP + name</div>
    </div>
    <div id="idle-timer">...</div>
    <div id="problem-display">...</div>
    <div id="answer-display">...</div>
    <div class="feedback-section">...</div>
  </main>
  <footer>
    <div class="custom-keyboard">numpad + backspace + attack</div>
  </footer>
</div>
<div id="gameover-screen">...</div>
```

## 🎯 System progresji wrogów

1. **Poziomy 1-3**: Losowe szkielety (skeleton, skeleton-warrior)
2. **Poziom 4+**: Kolejni bossi:
   - stone-warrior (scale 1.2)
   - serpentine (scale 1.3)
   - nindroid (scale 1.4)
   - ghost (scale 1.5)
   - oni (scale 1.6)
   - dragon-hunter (scale 1.7)
   - overlord (scale 2.0)

**HP wroga** = `baseHealth * scale + (level-1) * increment`

## 🛠️ Komendy

```bash
npm run dev      # Development server
npm run build    # Build do dist/
npm run preview  # Preview build
npm test         # Testy (watch mode)
npm test -- --run # Testy (single run)
npm run deploy   # Deploy na GitHub Pages
```

## 📝 Uwagi implementacyjne

1. **Custom keyboard** - `inputmode="none"` na input zapobiega natywnej klawiaturze
2. **Idle timer** - 15 sekund, wizualny pasek + atak wroga
3. **Instant questions** - nowe pytanie pojawia się natychmiast po odpowiedzi
4. **Enemy spawn animation** - scale + blur przy nowym wrogu
5. **Health regen** - +5 HP przy poprawnej odpowiedzi
6. **Streak bonus** - +3 DMG za każdą serię (max 5)
7. **localStorage** - zapisuje highScore, wybranego ninja i trudność
8. **Base path** - `/ninjago/` dla GitHub Pages

## 🎨 Kolory ninja

- Kai: `#C41E3A` (czerwony/ogień)
- Jay: `#0047AB` (niebieski/błyskawica)
- Cole: `#2F2F2F` (czarny/ziemia)
- Zane: `#87CEEB` (jasnoniebieski/lód)
- Lloyd: `#228B22` (zielony/energia)
- Nya: `#4169E1` (niebieski/woda)

## 🧪 Testy

35 testów w `tests/game.test.ts`:

- Generowanie zadań (dodawanie, odejmowanie)
- Zarządzanie stanem gry
- Stałe (ninja, trudności)
- Persystencja (localStorage)
