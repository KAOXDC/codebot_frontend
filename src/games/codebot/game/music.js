// Motor de música synthwave/cyberpunk. Recibe un AudioContext y un destino, así que sirve para
// sonar en vivo y también para renderizar sin conexión (pruebas).
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function createMusic(ac, dest) {
  const out = ac.createGain();
  out.gain.value = 0.7;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 5;
  out.connect(comp);
  comp.connect(dest);

  const bus = ac.createGain(); // batería y bajo
  bus.connect(out);
  const duck = ac.createGain(); // pads, arpegios y lead: se "agachan" con cada bombo (sidechain falso)
  duck.connect(out);

  // Eco sincronizado al tempo + reverberación corta
  const echo = ac.createDelay(1);
  const fb = ac.createGain();
  fb.gain.value = 0.38;
  const elp = ac.createBiquadFilter();
  elp.type = 'lowpass';
  elp.frequency.value = 2600;
  echo.connect(elp); elp.connect(fb); fb.connect(echo); elp.connect(duck);
  const len = Math.floor(ac.sampleRate * 1.8);
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const reverb = ac.createConvolver();
  reverb.buffer = ir;
  const rg = ac.createGain();
  rg.gain.value = 0.45;
  reverb.connect(rg); rg.connect(duck);
  const nl = Math.floor(ac.sampleRate * 0.5);
  const noiseBuf = ac.createBuffer(1, nl, ac.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;

  // ---- Instrumentos ----
  function note(type, f, t, dur, vol, o = {}) {
    const g = ac.createGain();
    const atk = o.atk ?? 0.008;
    const rel = o.rel ?? 0.06;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.setValueAtTime(vol, t + Math.max(atk, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    let node = g;
    if (o.lp) {
      const fl = ac.createBiquadFilter();
      fl.type = 'lowpass';
      fl.Q.value = o.q ?? 2;
      fl.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + dur);
      g.connect(fl);
      node = fl;
    }
    const detunes = o.detune ? [-o.detune, o.detune] : [0];
    detunes.forEach((dt) => {
      const osc = ac.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      osc.detune.value = dt;
      osc.connect(g);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
    node.connect(o.to || duck);
    if (o.echo) { const s = ac.createGain(); s.gain.value = o.echo; node.connect(s); s.connect(echo); }
    if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; node.connect(s); s.connect(reverb); }
  }

  function noise(t, kind, f, vol, dur, to) {
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const fl = ac.createBiquadFilter();
    fl.type = kind;
    fl.frequency.value = f;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(to || bus);
    s.start(t, Math.random() * 0.3);
    s.stop(t + dur + 0.02);
  }

  function kick(t, vol = 0.9) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + 0.36);
    noise(t, 'highpass', 3000, vol * 0.12, 0.02);
    // sidechain: baja pads/arpegios y los devuelve en ~0.2 s
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(0.35, t);
    duck.gain.linearRampToValueAtTime(1, t + 0.2);
  }
  const clap = (t, vol = 0.5) => {
    [0, 0.011, 0.022].forEach((d) => noise(t + d, 'bandpass', 1700, vol * 0.5, 0.05));
    noise(t + 0.03, 'bandpass', 1500, vol * 0.5, 0.18);
    note('triangle', 190, t, 0.1, vol * 0.25, { to: bus, atk: 0.001 });
  };
  const hat = (t, vol = 0.14, open = false) => noise(t, 'highpass', 7500, vol, open ? 0.2 : 0.045);

  // Bajo "synthwave": sierra filtrada con barrido + sub senoidal
  function bass(m, t, dur, vol = 0.22, lp = 650) {
    note('sawtooth', mtof(m), t, dur, vol, { to: bus, lp, lpTo: lp * 0.45, q: 5, atk: 0.004, rel: 0.04 });
    note('sine', mtof(m), t, dur, vol * 0.9, { to: bus, atk: 0.004, rel: 0.04 });
  }
  const padChord = (ch, t, dur, vol, lp) =>
    // dura un poco más que el compás: cada acorde se mezcla con el siguiente (sin huecos al repetir)
    ch.forEach((m) => note('sawtooth', mtof(m), t, dur + 1.0, vol, { detune: 9, lp, q: 0.8, atk: 0.55, rel: 1.0, rev: 0.5 }));
  const pluck = (m, t, dur, vol = 0.07, o = {}) =>
    note('square', mtof(m), t, dur, vol, { lp: 3200, lpTo: 600, q: 4, atk: 0.003, rel: 0.05, echo: 0.35, rev: 0.25, ...o });
  const lead = (m, t, dur, vol = 0.06, o = {}) =>
    note('sawtooth', mtof(m), t, dur, vol, { detune: 7, lp: 2600, q: 1.5, atk: 0.02, rel: 0.12, echo: 0.4, rev: 0.4, ...o });

  const at = (arr, i) => arr[i % arr.length];

  // ------------------------------------------------------------------------------------------
  // 0 · SECUENCIAS — "Neon Streets": la -menor, 100 bpm. Arpegio que sube paso a paso, una nota tras otra.
  const T0 = {
    bpm: 100, bars: 4,
    play(bar, s, t) {
      const root = at([45, 41, 48, 43], bar);
      const ch = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]][bar % 4];
      if (s === 0) padChord(ch, t, L(0) * 16, 0.022, 1100);
      if (s % 4 === 0) kick(t);
      if (s === 4 || s === 12) clap(t);
      if (s % 4 === 2) hat(t, 0.16, true); else if (s % 2 === 1) hat(t, 0.05);
      if (s % 2 === 0) bass(s % 8 === 6 ? root + 12 : root, t, L(0) * 1.7, 0.2);
      const ord = [0, 1, 2, 3, 2, 1, 0, 1]; // 1-2-3-4: la secuencia es el tema
      const tones = [...ch, ch[0] + 12];
      if (s % 2 === 0) pluck(tones[ord[(s / 2) % 8] % 4] + 12, t, L(0) * 2, 0.055);
      if (bar % 2 === 1 && [0, 6, 10].includes(s)) lead(ch[2] + 24, t, L(0) * 4, 0.04);
    },
  };

  // 1 · FUNCIONES — "Subroutine": re menor, 108 bpm. Un motivo (la función) que se llama una y otra vez.
  const MOTIF = [0, 0, 0, 7, 0, 0, 5, 0, 3, 0, 0, 0, 7, 0, 0, 0]; // grados sobre la fundamental
  const T1 = {
    bpm: 108, bars: 4,
    play(bar, s, t) {
      const root = at([50, 46, 53, 48], bar);
      const ch = [[62, 65, 69], [58, 62, 65], [65, 69, 72], [60, 64, 67]][bar % 4];
      if (s === 0) padChord(ch, t, L(1) * 16, 0.02, 1000);
      if ([0, 6, 10].includes(s)) kick(t);
      if (s === 4 || s === 12) clap(t, 0.55);
      if (s % 2 === 0) hat(t, 0.1); else hat(t, 0.04);
      if ([0, 3, 6, 10, 12, 14].includes(s)) bass(root - 12 + (s === 14 ? 12 : 0), t, L(1) * 2.2, 0.21, 700);
      // llamada a la función: el mismo motivo en cada compás, transpuesto a su acorde
      const g = MOTIF[s];
      if (g || (s === 0 && bar >= 0)) lead(root + 12 + g + (bar === 3 && s === 12 ? 5 : 0), t, L(1) * 2.6, 0.055, { echo: 0.45 });
      if (s === 8 && bar % 2 === 1) pluck(root + 31, t, L(1) * 2, 0.05);
    },
  };

  // 2 · BUCLES — "Loop Runner": mi menor, 118 bpm. Bajo en galope y un riff de 4 notas que gira sin parar.
  const RIFF = [64, 67, 71, 67]; // se repite cada 4 pasos
  const T2 = {
    bpm: 118, bars: 4,
    play(bar, s, t) {
      const root = at([40, 40, 36, 38], bar);
      const ch = [[52, 55, 59], [52, 55, 59], [48, 52, 55], [50, 54, 57]][bar % 4];
      if (s === 0) padChord(ch.map((m) => m + 12), t, L(2) * 16, 0.018, 700 + bar * 450);
      if (s % 4 === 0) kick(t, 0.95);
      if (s === 4 || s === 12) clap(t, 0.5);
      if (s % 2 === 0) hat(t, 0.13, s % 4 === 2);
      bass(root + (s % 4 === 3 ? 12 : 0), t, L(2) * 0.95, 0.19, 500 + (bar % 2) * 300); // 16avos sin parar
      const m = RIFF[s % 4] + (bar === 2 ? -4 : bar === 3 ? -2 : 0);
      pluck(m + 12, t, L(2) * 1.6, 0.045, { echo: 0.5 });
      if (s === 0 && bar === 3) noise(t, 'bandpass', 3000, 0.1, L(2) * 12);
    },
  };

  // 3 · CONDICIONALES — "Branch.exe": sol menor, 92 bpm. Dos caminos: si (menor) / si no (mayor), con glitch.
  const T3 = {
    bpm: 92, bars: 4,
    play(bar, s, t) {
      const root = at([43, 39, 43, 38], bar); // Gm  Eb  Gm  D (¡la rama mayor!)
      const ch = [[55, 58, 62], [51, 55, 58], [55, 58, 62], [50, 54, 57]][bar % 4];
      const rama = bar === 3;
      if (s === 0) padChord(ch, t, L(3) * 16, 0.022, rama ? 1800 : 950);
      if ([0, 7, 10].includes(s)) kick(t, 0.95);
      if (s === 8) clap(t, 0.6);
      if (s % 2 === 0) hat(t, 0.1, s === 14);
      if ([0, 3, 7, 10, 12].includes(s)) bass(root, t, L(3) * 2.4, 0.22, 600);
      const lm = bar % 2 === 0 ? [0, 0, 3, 0, 7, 0, 0, 10] : [0, 0, 7, 0, 5, 0, 3, 0];
      const g = lm[s % 8];
      if (g && s % 2 === 0) lead(root + 24 + g + (rama ? 1 : 0), t, L(3) * 3, 0.05, { type: 'square' });
      // glitch: ráfagas de ruido y notas tartamudas antes de bifurcar
      if (bar % 2 === 1 && s >= 12) {
        noise(t, 'highpass', 4000, 0.08, L(3) * 0.8);
        pluck(root + 36, t, L(3) * 0.8, 0.04, { echo: 0.2 });
      }
      if (rama && s === 8) lead(root + 28, t, L(3) * 6, 0.055);
    },
  };

  // 4 · MENÚ / FINAL — "Night City": do menor, 84 bpm. Atmosférico: pads lentos, arpegio escaso, bombo suave.
  const T4 = {
    bpm: 84, bars: 4,
    play(bar, s, t) {
      const root = at([36, 32, 39, 34], bar);
      const ch = [[60, 63, 67], [56, 60, 63], [63, 67, 70], [58, 62, 65]][bar % 4];
      if (s === 0) padChord([...ch, ch[0] + 12], t, L(4) * 16, 0.024, 1300);
      if (s === 0 || s === 8) kick(t, 0.6);
      if (s % 4 === 2) hat(t, 0.07);
      if (s === 0 || s === 10) bass(root, t, L(4) * 6, 0.22, 420);
      if ([0, 3, 6, 9, 12, 14].includes(s)) pluck(ch[[0, 1, 2, 1, 2, 1][[0, 3, 6, 9, 12, 14].indexOf(s)]] + 24, t, L(4) * 3, 0.04, { echo: 0.55, rev: 0.45 });
      if (s === 0 && bar % 2 === 0) lead(ch[2] + 12, t, L(4) * 12, 0.04, { atk: 0.4, rel: 0.6 });
    },
  };

  const tracks = [T0, T1, T2, T3, T4];
  const step = (id) => 60 / tracks[id].bpm / 4;
  function L(id) { return step(id); }

  return {
    tracks,
    out,
    step,
    setTempo(id, t = ac.currentTime) { echo.delayTime.setTargetAtTime(step(id) * 3, t, 0.05); },
    play(id, bar, s, t) {
      tracks[id].play(bar, s, t);
      // remate del último compás: redoble de hi-hats que "empuja" hacia el primer tiempo del bucle
      if (bar === tracks[id].bars - 1 && s >= 12 && id < 4) {
        hat(t, 0.05 + (s - 12) * 0.03);
        if (s === 12) noise(t, 'highpass', 2500, 0.06, step(id) * 4.5);
      }
    },
  };
}
