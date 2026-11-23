// Todo el sonido se genera con Web Audio: no hay archivos de audio.
let ac = null;
let master = null;
let muted = false;
let musicOn = false;
let timer = null;
let paso = 0;

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

// Melodía alegre en Do mayor (bucle de 32 corcheas) con bajo
const MEL = [523,0,659,0,784,659,0,587, 659,0,523,0,587,659,0,0, 523,0,659,0,784,880,0,784, 659,587,523,0,587,0,523,0];
const BAS = [131,0,0,0,196,0,0,0, 175,0,0,0,196,0,0,0, 131,0,0,0,196,0,0,0, 175,0,0,0,131,0,0,0];

const tick = () => {
  if (!ac) return;
  const t = ac.currentTime + 0.05;
  const i = paso % MEL.length;
  if (!muted) {
    if (MEL[i]) tone(MEL[i], t, 0.22, 'triangle', 0.045);
    if (BAS[i]) tone(BAS[i], t, 0.4, 'sine', 0.07);
    if (i % 4 === 0) tone(60, t, 0.08, 'sine', 0.08, 40);
  }
  paso++;
};

export const Snd = {
  init,
  startMusic() {
    init();
    if (musicOn || !ac) return;
    musicOn = true;
    timer = setInterval(tick, 260);
  },
  stopMusic() {
    clearInterval(timer);
    musicOn = false;
  },
  toggle() {
    muted = !muted;
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
