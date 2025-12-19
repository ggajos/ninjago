# Plan: Enhance Ninjago Math Game Immersion

Make the educational math game more engaging through enhanced visual feedback, character-specific effects, and tactile responses—without adding background music.

## Steps

### STEP-01: Add haptic feedback system ✅ DONE

**File:** `src/main.ts`

Implement `navigator.vibrate()` patterns for mobile devices:

- `tap`: short 10ms pulse for button presses
- `hit`: 50ms pulse when attacking enemy
- `combo`: rhythmic pattern [30, 20, 30, 20, 50] for combo hits
- `damage`: strong pattern [100, 30, 100] when receiving damage

### STEP-02: Create character-specific elemental effects ✅ DONE

**Files:** `src/main.ts`, `src/style.css`

Add particle bursts matching each ninja's element when attacking:

- 🔥 Kai - fire particles with orange/red glow
- ❄️ Zane - ice crystals with cyan glow
- ⚡ Jay - lightning sparks with yellow/blue glow
- 🪨 Cole - rock fragments with brown glow
- 💧 Nya - water droplets with blue glow
- ✨ Lloyd - energy sparkles with green/gold glow

### STEP-03: Enhance health bar animations ✅ DONE

**File:** `src/style.css`

- Add `healthPulse` animation triggering on damage (brightness flash)
- Add `criticalPulse` infinite red glow when HP < 25%
- Smooth width transitions (0.3s ease-out)
- Color shift from green → yellow → red based on HP percentage

### STEP-04: Add problem transition effects ✅ DONE

**Files:** `src/main.ts`, `src/style.css`

Animate math problems for smoother flow:

- Exit animation: scale down to 0.8 + fade out + slide up
- Enter animation: scale from 1.2 + fade in + bounce easing
- 150ms exit, 300ms enter timing

### STEP-05: Implement escalating combo visuals ✅ DONE

**File:** `src/main.ts`, `src/style.css`

Replace current combo display with intensity levels:

- 3+ combo: normal display with glow
- 5+ combo: "SUPER" label, larger scale, stronger glow
- 7+ combo: "EPIC" label, screen border pulse effect
- 10+ combo: "LEGENDARY" label, full elemental burst + screen flash

### STEP-06: Add numpad button press feedback ✅ DONE

**File:** `src/style.css`

- Visual bounce animation on press (scale 1 → 0.9 → 1)
- Ninja-color glow matching current character
- Ripple effect emanating from touch point

## Further Considerations

### CONSIDER-01: Add journey progress bar

**Impact:** Adds long-term motivation
**Complexity:** Medium

Visual enemy progression showing:

- ✅ Defeated enemies (greyed out, checkmark)
- 🎯 Current enemy (highlighted, pulsing)
- 🔒 Upcoming enemies (silhouettes)

Shows player how far they've come and how close to final boss.

### CONSIDER-02: Per-enemy ambient sound effects

**Impact:** Enhances atmosphere depth
**Complexity:** Medium
**File:** `src/sounds.ts`

Subtle looping sounds per enemy type:

- Skeleton: bone rattling
- Stone Warrior: deep rumble
- Serpentine: hissing
- Nindroid: electric hum
- Ghost: ethereal whispers
- Oni: demonic growl
- Overlord: ominous pulse

Requires additional Web Audio oscillator configurations.

### CONSIDER-03: Ninja voice lines as text-to-speech

**Impact:** Adds personality
**Complexity:** Low
**Risk:** May be distracting during focused math practice

Use Web Speech API to read encouragement/comfort messages aloud. Could be toggled on/off in settings.
