// Todo el sonido se genera con Web Audio: no hay archivos de audio.
// Música: synthwave / cyberpunk, una pista por temática (0 Secuencias, 1 Funciones, 2 Bucles, 3 Condicionales) y una de menú (4).
import { createMusic } from './music.js';
let ac = null;
let master = null;
let muted = false;
let musicOn = false;
let timer = null;

const init = () => {
  if (ac) {
    if (ac.state === 'suspended') ac.resume();
    return;
  }
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return;
  ac = new C();
  master = ac.createGain();
  master.gain.value = 0.9;
  master.connect(ac.destination);
};

const now = () => (ac ? ac.currentTime : 0);

const tone = (f, t0, dur, type = 'sine', vol = 0.15, f2 = null) => {
  if (!ac || muted) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
};

const fx = {
  click() { tone(660, now(), 0.06, 'triangle', 0.1); },
  remove() { tone(330, now(), 0.08, 'triangle', 0.1, 220); },
  step() { const t = now(); tone(140, t, 0.09, 'square', 0.07, 70); tone(900, t, 0.03, 'square', 0.03); },
  turn() { tone(500, now(), 0.12, 'sine', 0.09, 800); },
  jump() { tone(300, now(), 0.22, 'square', 0.09, 780); },
  bump() { tone(110, now(), 0.15, 'sawtooth', 0.1, 60); },
  bulb() {
    const t = now();
    [880, 1175, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 0.35, 'sine', 0.11));
    tone(1568, t + 0.3, 0.5, 'triangle', 0.05);
  },
  win() {
    const t = now();
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.11, 0.3, 'triangle', 0.13));
    tone(1047, t + 0.6, 0.6, 'sine', 0.1);
  },
  lose() {
    const t = now();
    [392, 330, 262].forEach((f, i) => tone(f, t + i * 0.16, 0.3, 'sawtooth', 0.07));
  },
  star(i = 0) { tone(700 + i * 220, now(), 0.25, 'sine', 0.12); },
};


let music = null;
let trackId = 4;
let musNext = 0;
let musStep = 0;
let activeTrack = 4;
let pendingTrack = null; // cambio de pista: se aplica justo en la siguiente barra, sin cortes

const ensureMusic = () => {
  if (!music && ac) music = createMusic(ac, master);
  return music;
};

const tick = () => {
  if (!ac || !music) return;
  if (musNext < ac.currentTime - 0.5) musNext = ac.currentTime + 0.05; // la pestaña estuvo dormida
  // Margen largo: si el navegador frena los temporizadores (pestaña en segundo plano), la música no se corta.
  while (musNext < ac.currentTime + 1.2) {
    if (musStep % 16 === 0 && pendingTrack !== null) {
      activeTrack = pendingTrack;
      pendingTrack = null;
      musStep = 0;
      music.setTempo(activeTrack, musNext);
    }
    const tr = music.tracks[activeTrack];
    music.play(activeTrack, Math.floor(musStep / 16) % tr.bars, musStep % 16, musNext);
    musNext += music.step(activeTrack);
    musStep = (musStep + 1) % (tr.bars * 16);
  }
};

const arrancarPista = () => {
  activeTrack = trackId;
  musStep = 0;
  musNext = ac.currentTime + 0.06;
  music.setTempo(activeTrack, ac.currentTime);
  const g = music.out.gain;
  g.cancelScheduledValues(ac.currentTime);
  g.setValueAtTime(0.0001, ac.currentTime);
  g.linearRampToValueAtTime(muted ? 0.0001 : 0.7, ac.currentTime + 1.2);
};

export const Snd = {
  init,
  startMusic() {
    init();
    if (!ac) return;
    if (ac.state === 'suspended') ac.resume();
    if (musicOn) return;
    ensureMusic();
    musicOn = true;
    arrancarPista();
    timer = setInterval(tick, 50);
  },
  stopMusic() {
    clearInterval(timer);
    musicOn = false;
  },
  // 0-3 = temática del nivel, 4 = menú / final. El cambio entra en la siguiente barra y las colas suenan hasta apagarse.
  setTrack(id) {
    if (id === trackId) return;
    trackId = id;
    if (!ac || !musicOn || !music) return;
    pendingTrack = id === activeTrack ? null : id;
  },
  toggle() {
    muted = !muted;
    if (music && ac) music.out.gain.setTargetAtTime(muted ? 0.0001 : 0.7, ac.currentTime, 0.05);
    return muted;
  },
  get muted() {
    return muted;
  },
};

// Reproduce un efecto sin romper el juego si el audio no está disponible
export const sfx = (nombre, ...args) => {
  try {
    if (fx[nombre]) fx[nombre](...args);
  } catch {
    /* sin audio */
  }
};
