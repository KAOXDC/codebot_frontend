// Sonido con Web Audio (sin archivos): efectos y música de fondo estilo 16 bits.
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

/* ---- Música: bajo, acordes, arpegio, melodía con eco y percusión suave ---- */
const BPM = 96
const STEP = 60 / BPM / 4
let musNext = 0
let musStep = 0
let bus = null
let echo = null
let reverb = null
let noiseBuf = null
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
const CHORDS = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60], [62, 65, 69], [64, 68, 71]]
const BASS = [45, 41, 48, 43, 45, 41, 50, 40]
const MELODY = [
  [76, 0, 0, 0, 72, 0, 74, 0, 76, 0, 0, 0, 79, 0, 76, 0],
  [77, 0, 0, 0, 72, 0, 76, 0, 77, 0, 0, 0, 81, 0, 77, 0],
  [79, 0, 0, 0, 76, 0, 72, 0, 79, 0, 0, 0, 84, 0, 79, 0],
  [74, 0, 0, 0, 71, 0, 74, 0, 79, 0, 76, 0, 74, 0, 71, 0],
  [76, 0, 72, 0, 76, 0, 81, 0, 79, 0, 76, 0, 72, 0, 0, 0],
  [77, 0, 81, 0, 77, 0, 72, 0, 74, 0, 77, 0, 76, 0, 0, 0],
  [74, 0, 77, 0, 81, 0, 77, 0, 74, 0, 0, 0, 72, 0, 74, 0],
  [76, 0, 80, 0, 83, 0, 80, 0, 76, 0, 0, 0, 0, 0, 0, 0],
]

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
  fb.gain.value = 0.32
  const lp = AC.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2600
  echo.connect(lp)
  lp.connect(fb)
  fb.connect(echo)
  lp.connect(bus)
  const len = Math.floor(AC.sampleRate * 1.8)
  const ir = AC.createBuffer(2, len, AC.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  reverb = AC.createConvolver()
  reverb.buffer = ir
  const rg = AC.createGain()
  rg.gain.value = 0.35
  reverb.connect(rg)
  rg.connect(bus)
  const nl = Math.floor(AC.sampleRate * 0.5)
  noiseBuf = AC.createBuffer(1, nl, AC.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1
}

function note(type, freq, t, dur, vol, o) {
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
    l.frequency.value = 5.5
    lg.gain.value = freq * 0.006
    l.connect(lg)
    lg.connect(osc.frequency)
    l.start(t + 0.12)
    l.stop(t + dur + 0.05)
  }
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function kick(t) {
  const o = AC.createOscillator()
  const g = AC.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(150, t)
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12)
  g.gain.setValueAtTime(0.4, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  o.connect(g)
  g.connect(bus)
  o.start(t)
  o.stop(t + 0.22)
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

function playStep(step, t) {
  const bar = Math.floor(step / 16)
  const s = step % 16
  const ch = CHORDS[bar]
  const bs = BASS[bar]
  const L = STEP
  if (s === 0) ch.forEach((m) => note('sawtooth', mtof(m), t, L * 16 * 0.96, 0.022, { atk: 0.25, rel: 0.5, lp: 1100, rev: 0.5 }))
  if ([0, 3, 6, 8, 11, 14].includes(s)) note('triangle', mtof(bs), t, L * 2.6, 0.16, { atk: 0.01, rel: 0.12 })
  if (s % 2 === 0) note('square', mtof(ch[(s / 2) % 3] + 12), t, L * 1.6, 0.026, { atk: 0.005, rel: 0.06, lp: 2400, echo: 0.35, rev: 0.2 })
  const m = MELODY[bar][s]
  if (m) {
    let k = s + 1
    while (k < 16 && !MELODY[bar][k]) k++
    const dur = L * (k - s) * 0.9
    note('square', mtof(m), t, dur, 0.05, { atk: 0.008, rel: 0.1, lp: 3000, echo: 0.45, rev: 0.3, vib: dur > L * 3 })
  }
  if (s === 0 || s === 8 || (bar % 2 === 1 && s === 10)) kick(t)
  if (s === 4 || s === 12) noiseHit(t, 1500, 0.16, 0.14)
  if (s % 2 === 0) noiseHit(t, 7000, 0.05, s % 8 === 6 ? 0.09 : 0.035)
}

function tick() {
  if (!AC) return
  if (musNext < AC.currentTime - 0.5) musNext = AC.currentTime + 0.05
  while (musNext < AC.currentTime + 0.25) {
    if (!muted) playStep(musStep, musNext)
    musNext += STEP
    musStep = (musStep + 1) % 128
  }
}

export function startMusic() {
  if (!AC || musicTimer) return
  try {
    if (AC.state === 'suspended') AC.resume()
  } catch {
    /* sin audio */
  }
  musicSetup()
  musNext = AC.currentTime + 0.08
  musStep = 0
  musicTimer = setInterval(tick, 50)
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
