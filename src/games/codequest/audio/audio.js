// Sonido con Web Audio (sin archivos): efectos y una pista de música sombría y épica por mundo.
// Módulo singleton: el navegador solo permite audio después de un gesto del usuario, por eso initAudio()
// se llama desde los clics.

let AC = null
let master = null
let muted = false
let musicTimer = null

export function initAudio() {
  if (AC) return
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    AC = new Ctor()
    master = AC.createGain()
    master.gain.value = 0.5
    master.connect(AC.destination)
  } catch {
    AC = null
  }
}

function tone(f, d, type, vol, when) {
  if (!AC || muted) return
  const t0 = when || AC.currentTime
  const o = AC.createOscillator()
  const g = AC.createGain()
  o.type = type || 'square'
  o.frequency.setValueAtTime(f, t0)
  g.gain.setValueAtTime(vol || 0.15, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
  o.connect(g)
  g.connect(master)
  o.start(t0)
  o.stop(t0 + d + 0.02)
}

const now = () => (AC ? AC.currentTime : 0)

export const sfx = {
  step: () => tone(180, 0.06, 'triangle', 0.12),
  bump: () => tone(90, 0.12, 'sawtooth', 0.18),
  attack: () => {
    tone(500, 0.05, 'sawtooth', 0.15)
    tone(250, 0.1, 'square', 0.12, now() + 0.04)
  },
  gem: () => [660, 880, 1320].forEach((f, i) => tone(f, 0.12, 'sine', 0.18, now() + i * 0.07)),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'square', 0.16, now() + i * 0.12)),
  fail: () => [300, 240, 180].forEach((f, i) => tone(f, 0.18, 'sawtooth', 0.14, now() + i * 0.1)),
  click: () => tone(700, 0.04, 'square', 0.1),
  hit: () => {
    tone(140, 0.15, 'sawtooth', 0.2)
    tone(90, 0.2, 'square', 0.12, now() + 0.05)
  },
}

/* ---- Música: una pista por mundo (0-5) y una para el menú/mapa (6). Tonalidades menores, tempo lento,
   pads largos con reverberación, tambores de guerra, campanas y melodías que respiran. ---- */
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
let STEP = 60 / 64 / 4
let musNext = 0
let musStep = 0
let bus = null
let echo = null
let reverb = null
let noiseBuf = null
let trackId = 6 // pista pedida
let activeTrack = 6 // pista que suena

function musicSetup() {
  if (bus || !AC) return
  bus = AC.createGain()
  bus.gain.value = 0.55
  const comp = AC.createDynamicsCompressor()
  bus.connect(comp)
  comp.connect(master)
  echo = AC.createDelay(1)
  echo.delayTime.value = STEP * 3
  const fb = AC.createGain()
  fb.gain.value = 0.34
  const lp = AC.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2200
  echo.connect(lp)
  lp.connect(fb)
  fb.connect(echo)
  lp.connect(bus)
  const len = Math.floor(AC.sampleRate * 3.2)
  const ir = AC.createBuffer(2, len, AC.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2)
  }
  reverb = AC.createConvolver()
  reverb.buffer = ir
  const rg = AC.createGain()
  rg.gain.value = 0.5
  reverb.connect(rg)
  rg.connect(bus)
  const nl = Math.floor(AC.sampleRate * 0.5)
  noiseBuf = AC.createBuffer(1, nl, AC.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1
}

// Una nota con envolvente, filtro, eco, reverberación y vibrato opcionales
function note(type, freq, t, dur, vol, o = {}) {
  const osc = AC.createOscillator()
  const g = AC.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  let out = g
  if (o.lp) {
    const f = AC.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = o.lp
    g.connect(f)
    out = f
  }
  const atk = o.atk || 0.01
  const rel = o.rel || 0.08
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + atk)
  g.gain.setValueAtTime(vol, t + Math.max(atk, dur - rel))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02)
  osc.connect(g)
  out.connect(bus)
  if (o.echo) {
    const s = AC.createGain()
    s.gain.value = o.echo
    out.connect(s)
    s.connect(echo)
  }
  if (o.rev) {
    const s = AC.createGain()
    s.gain.value = o.rev
    out.connect(s)
    s.connect(reverb)
  }
  if (o.vib) {
    const l = AC.createOscillator()
    const lg = AC.createGain()
    l.frequency.value = 5
    lg.gain.value = freq * 0.007
    l.connect(lg)
    lg.connect(osc.frequency)
    l.start(t + 0.15)
    l.stop(t + dur + 0.05)
  }
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

// Acorde sostenido: cada nota con otra ligeramente desafinada para dar cuerpo (efecto coro/cuerdas)
function pad(ch, t, dur, o) {
  ch.forEach((m) => {
    note(o.type, mtof(m), t, dur, o.vol, o)
    note(o.type, mtof(m) * 1.005, t, dur, o.vol * 0.7, o)
  })
}

// Melodía de una barra: cada nota dura hasta la siguiente
function lead(arr, bar, s, t, L, o) {
  const m = arr[bar][s]
  if (!m) return
  let k = s + 1
  while (k < 16 && !arr[bar][k]) k++
  note(o.type, mtof(m), t, L * (k - s) * 0.97, o.vol, o)
}

function noiseHit(t, hp, vol, dur) {
  const s = AC.createBufferSource()
  s.buffer = noiseBuf
  const f = AC.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = hp
  const g = AC.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f)
  f.connect(g)
  g.connect(bus)
  s.start(t, Math.random() * 0.2)
  s.stop(t + dur + 0.02)
}

// Tambor grave de guerra (tom): caída de tono + golpe de aire, con eco de sala
function tom(t, f, vol) {
  const o = AC.createOscillator()
  const g = AC.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(f * 1.9, t)
  o.frequency.exponentialRampToValueAtTime(f, t + 0.09)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
  o.connect(g)
  g.connect(bus)
  const r = AC.createGain()
  r.gain.value = 0.5
  g.connect(r)
  r.connect(reverb)
  o.start(t)
  o.stop(t + 0.55)
  noiseHit(t, 220, vol * 0.3, 0.07)
}

// Campana: varios parciales que se apagan solos
function bell(t, f, vol, dur) {
  ;[[1, 1], [2.76, 0.5], [5.4, 0.25], [8.9, 0.12]].forEach(([p, a]) => note('sine', f * p, t, dur / (0.6 + p * 0.25), vol * a, { atk: 0.002, rel: dur, rev: 0.8, echo: 0.2 }))
}

// Oleaje / viento: ruido filtrado que crece y se apaga
function swell(t, dur, vol, lp) {
  const s = AC.createBufferSource()
  s.buffer = noiseBuf
  s.loop = true
  const f = AC.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(lp * 0.4, t)
  f.frequency.linearRampToValueAtTime(lp, t + dur * 0.5)
  f.frequency.linearRampToValueAtTime(lp * 0.4, t + dur)
  const g = AC.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.5)
  g.gain.linearRampToValueAtTime(0.0001, t + dur)
  s.connect(f)
  f.connect(g)
  g.connect(bus)
  g.connect(reverb)
  s.start(t)
  s.stop(t + dur + 0.05)
}

function heartbeat(t, vol) {
  const o = AC.createOscillator()
  const g = AC.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(90, t)
  o.frequency.exponentialRampToValueAtTime(40, t + 0.14)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
  o.connect(g)
  g.connect(bus)
  o.start(t)
  o.stop(t + 0.28)
}

const pick = (arr, bar) => arr[bar % arr.length]

// ----- 0 · Bosque: flauta sobre cuerdas suaves y arpa, tambor lejano (La menor) -----
const MEL_FOREST = [
  [76, 0, 0, 0, 0, 0, 0, 0, 72, 0, 0, 0, 74, 0, 0, 0],
  [71, 0, 0, 0, 74, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0],
  [72, 0, 0, 0, 69, 0, 0, 0, 72, 0, 0, 0, 76, 0, 0, 0],
  [75, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
const forest = {
  bpm: 64, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 56, 59]], bar)
    if (s === 0) {
      pad(ch, t, L * 16, { type: 'triangle', vol: 0.03, atk: 0.9, rel: 1.2, lp: 1500, rev: 0.7 })
      note('sine', mtof(pick([45, 43, 41, 40], bar)), t, L * 16, 0.14, { atk: 0.3, rel: 0.8 })
      swell(t, L * 16, 0.018, 1800)
    }
    const hi = [0, 3, 6, 10, 13].indexOf(s)
    if (hi >= 0) note('triangle', mtof(ch[[0, 1, 2, 1, 2][hi]] + 12), t, L * 4, 0.035, { atk: 0.003, rel: L * 4, echo: 0.4, rev: 0.5 })
    lead(MEL_FOREST, bar, s, t, L, { type: 'sine', vol: 0.065, atk: 0.1, rel: 0.3, lp: 2600, vib: true, echo: 0.4, rev: 0.6 })
    if (s === 0 && bar % 2 === 0) tom(t, 95, 0.22)
    if (s === 8) tom(t, 110, 0.12)
  },
}

// ----- 1 · Volcán: metales graves, bajo galopante y taikos pesados (Re frigio) -----
const MEL_VOLCANO = [
  [62, 0, 0, 0, 65, 0, 0, 0, 69, 0, 0, 0, 68, 0, 65, 0],
  [70, 0, 0, 0, 69, 0, 0, 0, 65, 0, 0, 0, 62, 0, 0, 0],
  [67, 0, 0, 0, 72, 0, 0, 0, 70, 0, 0, 0, 67, 0, 0, 0],
  [69, 0, 0, 0, 73, 0, 0, 0, 74, 0, 0, 0, 0, 0, 0, 0],
]
const volcano = {
  bpm: 76, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[50, 53, 57], [46, 53, 58], [48, 55, 60], [45, 49, 52]], bar)
    const bs = pick([38, 34, 36, 33], bar)
    if (s === 0) pad(ch, t, L * 16, { type: 'sawtooth', vol: 0.024, atk: 0.15, rel: 0.6, lp: 900, rev: 0.5 })
    if ([0, 3, 6, 8, 11, 14].includes(s)) note('sawtooth', mtof(bs), t, L * 2.4, 0.15, { atk: 0.01, rel: 0.1, lp: 520 })
    lead(MEL_VOLCANO, bar, s, t, L, { type: 'sawtooth', vol: 0.045, atk: 0.06, rel: 0.15, lp: 1500, vib: true, echo: 0.3, rev: 0.4 })
    if (s === 0) tom(t, 62, 0.5)
    if (s === 6 && bar % 2 === 0) tom(t, 74, 0.3)
    if (s === 8) tom(t, 66, 0.4)
    if (s === 11 || s === 14) tom(t, 80, 0.26)
    if (s === 12) noiseHit(t, 900, 0.1, 0.16)
  },
}

// ----- 2 · Océano: arpegios acuosos y pad etéreo, sin percusión (Mi menor) -----
const MEL_OCEAN = [
  [71, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0],
  [79, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 72, 0, 0, 0],
  [76, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0],
  [71, 0, 0, 0, 74, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0],
]
const ocean = {
  bpm: 58, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[52, 59, 64], [48, 55, 59], [57, 60, 64], [47, 54, 59]], bar)
    if (s === 0) {
      pad(ch, t, L * 16, { type: 'sine', vol: 0.04, atk: 0.8, rel: 1.5, lp: 1400, rev: 0.9, vib: true })
      note('sine', mtof(pick([40, 36, 45, 35], bar)), t, L * 16, 0.13, { atk: 0.4, rel: 1 })
      swell(t, L * 16, 0.035, 1300)
    }
    if (s % 2 === 0) note('sine', mtof(ch[(s / 2) % 3] + 24), t, L * 3, 0.03, { atk: 0.005, rel: L * 3, echo: 0.6, rev: 0.5 })
    lead(MEL_OCEAN, bar, s, t, L, { type: 'triangle', vol: 0.05, atk: 0.12, rel: 0.5, lp: 3200, vib: true, echo: 0.5, rev: 0.8 })
  },
}

// ----- 3 · Cielo: coro de pads, campanas y timbales suaves (Si menor, himno épico) -----
const MEL_SKY = [
  [74, 0, 0, 0, 78, 0, 0, 0, 81, 0, 0, 0, 78, 0, 0, 0],
  [79, 0, 0, 0, 78, 0, 0, 0, 74, 0, 0, 0, 0, 0, 0, 0],
  [78, 0, 0, 0, 81, 0, 0, 0, 86, 0, 0, 0, 85, 0, 0, 0],
  [83, 0, 0, 0, 81, 0, 0, 0, 78, 0, 0, 0, 0, 0, 0, 0],
]
const sky = {
  bpm: 68, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[47, 54, 59], [55, 59, 62], [50, 57, 62], [57, 61, 64]], bar)
    if (s === 0) {
      pad([...ch, ch[0] + 12, ch[2] + 12], t, L * 16, { type: 'triangle', vol: 0.026, atk: 0.7, rel: 1.3, lp: 2200, rev: 0.9 })
      note('sine', mtof(pick([35, 31, 38, 33], bar)), t, L * 16, 0.13, { atk: 0.3, rel: 0.9 })
    }
    const m = MEL_SKY[bar][s]
    if (m) bell(t, mtof(m), 0.07, 2.4)
    if (s === 0 && bar % 2 === 0) tom(t, 70, 0.2)
    if (bar === 3 && (s === 8 || s === 10 || s === 12 || s === 14)) tom(t, 78, 0.14 + (s - 8) * 0.02)
  },
}

// ----- 4 · Montaña helada: cuerdas agudas, carillón escaso y latido (Fa# menor) -----
const MEL_ICE = [
  [78, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0],
  [74, 0, 0, 0, 0, 0, 0, 0, 78, 0, 0, 0, 0, 0, 0, 0],
  [81, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0],
  [80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0],
]
const CHIME_ICE = [[0, 90], [10, 85], [4, 86], [12, 93], [2, 88], [9, 81], [6, 92], [13, 85]]
const ice = {
  bpm: 52, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[54, 57, 61], [50, 57, 62], [57, 61, 64], [52, 56, 59]], bar)
    if (s === 0) {
      pad(ch.map((m) => m + 12), t, L * 16, { type: 'triangle', vol: 0.022, atk: 1.1, rel: 1.5, lp: 2400, rev: 0.9, vib: true })
      note('sine', mtof(pick([42, 38, 45, 40], bar)), t, L * 16, 0.12, { atk: 0.6, rel: 1 })
      swell(t, L * 16, 0.02, 2400)
    }
    lead(MEL_ICE, bar, s, t, L, { type: 'triangle', vol: 0.05, atk: 0.3, rel: 0.8, lp: 3400, vib: true, echo: 0.5, rev: 0.9 })
    CHIME_ICE.slice((bar % 2) * 2 + (bar > 1 ? 4 : 0), (bar % 2) * 2 + (bar > 1 ? 4 : 0) + 2).forEach(([cs, cm]) => {
      if (cs === s) bell(t, mtof(cm), 0.045, 3)
    })
    if (s === 0 || s === 2) heartbeat(t, s === 0 ? 0.16 : 0.1)
  },
}

// ----- 5 · Castillo: órgano oscuro, campana fúnebre y tambores de marcha (Re menor) -----
const MEL_CASTLE = [
  [69, 0, 0, 0, 0, 0, 0, 0, 65, 0, 0, 0, 62, 0, 0, 0],
  [70, 0, 0, 0, 0, 0, 0, 0, 65, 0, 0, 0, 69, 0, 0, 0],
  [67, 0, 0, 0, 0, 0, 0, 0, 70, 0, 0, 0, 69, 0, 0, 0],
  [73, 0, 0, 0, 0, 0, 0, 0, 74, 0, 0, 0, 0, 0, 0, 0],
]
const castle = {
  bpm: 62, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[50, 57, 65], [46, 58, 62], [43, 55, 58], [45, 57, 61]], bar)
    if (s === 0) {
      pad(ch, t, L * 16, { type: 'square', vol: 0.016, atk: 0.12, rel: 0.6, lp: 1500, rev: 0.6 })
      pad(ch, t, L * 16, { type: 'sawtooth', vol: 0.014, atk: 0.12, rel: 0.6, lp: 800, rev: 0.4 })
      if (bar % 2 === 0) bell(t, 146.8, 0.16, 4)
    }
    if (s === 0 || s === 8) note('sawtooth', mtof(pick([38, 34, 31, 33], bar)), t, L * 7, 0.15, { atk: 0.02, rel: 0.3, lp: 420 })
    lead(MEL_CASTLE, bar, s, t, L, { type: 'sawtooth', vol: 0.04, atk: 0.12, rel: 0.3, lp: 1200, vib: true, echo: 0.35, rev: 0.6 })
    if (s === 0) tom(t, 58, 0.5)
    if (s === 6) tom(t, 66, 0.28)
    if (s === 8) tom(t, 58, 0.42)
    if (s === 10) tom(t, 66, 0.28)
    if (s === 4 || s === 12) noiseHit(t, 1200, 0.07, 0.1)
  },
}

// ----- 6 · Menú y mapa: cuernos heroicos pero graves (Sol menor) -----
const MEL_MENU = [
  [74, 0, 0, 0, 0, 0, 0, 0, 70, 0, 0, 0, 67, 0, 0, 0],
  [75, 0, 0, 0, 0, 0, 0, 0, 70, 0, 0, 0, 74, 0, 0, 0],
  [77, 0, 0, 0, 0, 0, 0, 0, 74, 0, 0, 0, 70, 0, 0, 0],
  [72, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0],
]
const menu = {
  bpm: 70, bars: 4,
  play(bar, s, t, L) {
    const ch = pick([[43, 55, 58], [51, 55, 58], [46, 53, 58], [53, 57, 60]], bar)
    if (s === 0) {
      pad(ch, t, L * 16, { type: 'sawtooth', vol: 0.026, atk: 0.5, rel: 0.9, lp: 1200, rev: 0.7 })
      note('sine', mtof(pick([31, 39, 34, 41], bar)), t, L * 16, 0.13, { atk: 0.3, rel: 0.8 })
    }
    lead(MEL_MENU, bar, s, t, L, { type: 'sawtooth', vol: 0.04, atk: 0.1, rel: 0.3, lp: 1600, vib: true, echo: 0.35, rev: 0.6 })
    if (s === 0) tom(t, 72, 0.3)
    if (s === 8) tom(t, 80, 0.18)
  },
}

const TRACKS = [forest, volcano, ocean, sky, ice, castle, menu]
const trackOf = (id) => TRACKS[id] || menu
const stepOf = (id) => 60 / trackOf(id).bpm / 4

function tick() {
  if (!AC) return
  if (musNext < AC.currentTime - 0.5) musNext = AC.currentTime + 0.05
  const tr = trackOf(activeTrack)
  while (musNext < AC.currentTime + 0.25) {
    if (!muted) tr.play(Math.floor(musStep / 16) % tr.bars, musStep % 16, musNext, STEP)
    musNext += STEP
    musStep = (musStep + 1) % (tr.bars * 16)
  }
}

export function startMusic() {
  if (!AC) return
  try {
    if (AC.state === 'suspended') AC.resume()
  } catch {
    /* sin audio */
  }
  if (musicTimer) return
  musicSetup()
  activeTrack = trackId
  STEP = stepOf(activeTrack)
  echo.delayTime.value = STEP * 3
  musNext = AC.currentTime + 0.08
  musStep = 0
  bus.gain.cancelScheduledValues(AC.currentTime)
  bus.gain.setValueAtTime(0.0001, AC.currentTime)
  bus.gain.linearRampToValueAtTime(0.55, AC.currentTime + 1.5)
  musicTimer = setInterval(tick, 50)
}

// Elige la pista (0-5 = mundo, 6 = menú). Si ya suena otra, hace un fundido cruzado.
export function setTrack(id) {
  if (id === trackId) return
  trackId = id
  if (!AC || !musicTimer || !bus) return
  const t = AC.currentTime
  bus.gain.cancelScheduledValues(t)
  bus.gain.setValueAtTime(bus.gain.value, t)
  bus.gain.linearRampToValueAtTime(0.0001, t + 0.4)
  setTimeout(() => {
    if (!AC || !musicTimer) return
    activeTrack = trackId
    STEP = stepOf(activeTrack)
    echo.delayTime.value = STEP * 3
    musStep = 0
    musNext = AC.currentTime + 0.05
    bus.gain.cancelScheduledValues(AC.currentTime)
    bus.gain.setValueAtTime(0.0001, AC.currentTime)
    bus.gain.linearRampToValueAtTime(0.55, AC.currentTime + 1.5)
  }, 430)
}

export function stopMusic() {
  clearInterval(musicTimer)
  musicTimer = null
}

export function setMuted(m) {
  muted = m
}

export function isMuted() {
  return muted
}
