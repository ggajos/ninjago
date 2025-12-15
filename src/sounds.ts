/**
 * Ninjago Math Game - Sound Effects System
 *
 * Prosty system dźwięków używający Web Audio API.
 * Generuje dźwięki programowo bez potrzeby zewnętrznych plików.
 */

// ============================================================================
// TYPY
// ============================================================================

export type SoundType =
  | "correct"
  | "wrong"
  | "attack"
  | "hit"
  | "victory"
  | "gameOver"
  | "click"
  | "start";

// ============================================================================
// STAN
// ============================================================================

let audioContext: AudioContext | null = null;
let isMuted = false;

// Sprawdź localStorage przy starcie
const savedMuted = localStorage.getItem("ninjago-muted");
if (savedMuted !== null) {
  isMuted = savedMuted === "true";
}

// ============================================================================
// INICJALIZACJA
// ============================================================================

/**
 * Inicjalizuje AudioContext (musi być wywołane po interakcji użytkownika)
 */
function initAudio(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioContext;
}

// ============================================================================
// GENERATORY DŹWIĘKÓW
// ============================================================================

/**
 * Dźwięk poprawnej odpowiedzi - przyjemny akord
 */
function playCorrectSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Trzy nuty tworzące akord (C-E-G)
  const frequencies = [523.25, 659.25, 783.99];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.05 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.05);
    osc.stop(now + 0.5);
  });
}

/**
 * Dźwięk błędnej odpowiedzi - krótki brzęczyk
 */
function playWrongSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(150, now + 0.2);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Dźwięk ataku gracza - szybki świst
 */
function playAttackSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Dźwięk otrzymania obrażeń - uderzenie
 */
function playHitSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Noise burst dla efektu uderzenia
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * Dźwięk zwycięstwa - fanfara
 */
function playVictorySound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Melodia zwycięstwa (C-E-G-C wysoko)
  const notes = [
    { freq: 523.25, start: 0, duration: 0.15 },
    { freq: 659.25, start: 0.1, duration: 0.15 },
    { freq: 783.99, start: 0.2, duration: 0.15 },
    { freq: 1046.5, start: 0.3, duration: 0.4 },
  ];

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = note.freq;

    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(0.15, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      now + note.start + note.duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.1);
  });
}

/**
 * Dźwięk game over - smutna melodia
 */
function playGameOverSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Opadająca melodia
  const notes = [
    { freq: 392, start: 0, duration: 0.3 },
    { freq: 349.23, start: 0.25, duration: 0.3 },
    { freq: 293.66, start: 0.5, duration: 0.5 },
  ];

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = note.freq;

    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(0.12, now + note.start + 0.05);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      now + note.start + note.duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.1);
  });
}

/**
 * Dźwięk kliknięcia przycisku
 */
function playClickSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 600;

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Dźwięk startu gry - gotowy do walki
 */
function playStartSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Dwa szybkie dźwięki
  [0, 0.1].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = i === 0 ? 440 : 880;

    gain.gain.setValueAtTime(0.1, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.15);
  });
}

// ============================================================================
// API PUBLICZNE
// ============================================================================

/**
 * Odtwarza dźwięk określonego typu
 */
export function playSound(type: SoundType): void {
  if (isMuted) return;

  try {
    const ctx = initAudio();

    // Wznów kontekst jeśli jest wstrzymany (wymaganie przeglądarek)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    switch (type) {
      case "correct":
        playCorrectSound(ctx);
        break;
      case "wrong":
        playWrongSound(ctx);
        break;
      case "attack":
        playAttackSound(ctx);
        break;
      case "hit":
        playHitSound(ctx);
        break;
      case "victory":
        playVictorySound(ctx);
        break;
      case "gameOver":
        playGameOverSound(ctx);
        break;
      case "click":
        playClickSound(ctx);
        break;
      case "start":
        playStartSound(ctx);
        break;
    }
  } catch (e) {
    // Cicho ignoruj błędy audio (np. brak wsparcia)
    console.warn("Audio error:", e);
  }
}

/**
 * Ustawia stan wyciszenia
 */
export function setMuted(muted: boolean): void {
  isMuted = muted;
  localStorage.setItem("ninjago-muted", String(muted));
}

/**
 * Zwraca czy dźwięk jest wyciszony
 */
export function getMuted(): boolean {
  return isMuted;
}

/**
 * Przełącza stan wyciszenia
 */
export function toggleMuted(): boolean {
  setMuted(!isMuted);
  return isMuted;
}
