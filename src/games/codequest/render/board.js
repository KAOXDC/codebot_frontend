// Tablero: dibuja la mazmorra, el héroe, los efectos de ataque y la iluminación de antorchas.
import { HERO_COLORS } from '../engine/heroes.js'
import { LEVELS } from '../engine/levels.js'
import { T, rnd, drawFloor, drawWall, drawGem, drawEnemy, drawProp } from './sprites.js'
import { themeOf, drawAmbient } from './themes.js'
import { heroSheet, FRAME, IDLE_FRAMES, ATTACK_FRAMES } from './assets.js'

const flick = (t, ph) => 1 + Math.sin(t / 90 + ph) * 0.08 + Math.sin(t / 37 + ph * 2.3) * 0.05

// Una instancia por canvas. levelIndex solo sirve para variar la semilla del suelo y el nº de antorchas.
export function createBoard(canvas, levelIndex) {
  const ctx = canvas.getContext('2d')
  const th = themeOf(LEVELS[levelIndex]?.world)
  let fx = []
  let dying = []
  let parts = []
  let torches = null
  let light = null

  function getTorches(s) {
    if (torches) return torches
    const cand = []
    for (let x = 0; x < s.w; x++)
      for (let y = 0; y < s.h - 1; y++)
        if (s.walls.has(x + ',' + y) && !s.walls.has(x + ',' + (y + 1))) cand.push([x, y])
    const n = Math.min(4, 1 + Math.floor(levelIndex / 5))
    torches = []
    for (let i = 0; i < n && cand.length; i++) torches.push(cand[Math.floor(((i + 0.5) * cand.length) / n)])
    return torches
  }

  function attack(frame, t, heroId) {
    const dir = frame.face === 1 ? -1 : 1
    const hits = frame.hits && frame.hits.length ? frame.hits : [{ x: frame.x + dir, y: frame.y, dx: dir, dy: 0, miss: 1 }]
    hits.forEach((h) => {
      fx.push({ hero: heroId, x: frame.x, y: frame.y, dx: h.dx, dy: h.dy, t0: t, miss: !!h.miss })
      if (!h.miss) {
        dying.push({ x: h.x, y: h.y, dx: h.dx, dy: h.dy, t0: t })
        const col = HERO_COLORS[heroId]
        const r = rnd((Math.floor(t) % 997) + 7)
        for (let i = 0; i < 24; i++) {
          const a = r() * Math.PI * 2
          const sp = 0.4 + r() * 1.6
          parts.push({ x: h.x * T + 16, y: h.y * T + 18, vx: Math.cos(a) * sp + h.dx * 0.8, vy: Math.sin(a) * sp - 0.5, t0: t + 290, life: 500 + r() * 300, c: i % 3 ? col : '#ef4444' })
        }
      }
    })
    if (fx.length > 40) fx = fx.slice(-40)
    if (parts.length > 400) parts = parts.slice(-400)
  }

  function clearEffects() {
    fx = []
    dying = []
    parts = []
  }

  function lighting(s, t, tc) {
    const W = s.w * T
    const H = s.h * T
    if (!light) light = document.createElement('canvas')
    if (light.width !== W || light.height !== H) {
      light.width = W
      light.height = H
    }
    const l = light.getContext('2d')
    l.globalCompositeOperation = 'source-over'
    l.clearRect(0, 0, W, H)
    l.fillStyle = `rgba(${th.darkRGB},${th.dark})`
    l.fillRect(0, 0, W, H)
    l.globalCompositeOperation = 'destination-out'
    const hole = (cx, cy, r, a) => {
      const g = l.createRadialGradient(cx, cy, r * 0.15, cx, cy, r)
      g.addColorStop(0, 'rgba(0,0,0,' + a + ')')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      l.fillStyle = g
      l.fillRect(cx - r, cy - r, r * 2, r * 2)
    }
    hole(s.x * T + 16, s.y * T + 16, T * 3.4, 0.95)
    tc.forEach((c, i) => hole(c[0] * T + 16, c[1] * T + 16, T * 3.6 * flick(t, i * 1.7 + 1), 0.95))
    ctx.drawImage(light, 0, 0)
    ctx.globalCompositeOperation = 'lighter'
    tc.forEach((c, i) => {
      const cx = c[0] * T + 16
      const cy = c[1] * T + 16
      const r = T * 3.2 * flick(t, i * 1.7 + 1)
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r)
      g.addColorStop(0, th.glow)
      g.addColorStop(1, th.glow.replace(/,[\d.]+\)$/, ',0)'))
      ctx.fillStyle = g
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    })
    ctx.globalCompositeOperation = 'source-over'
  }

  function drawFX(t) {
    fx = fx.filter((e) => t - e.t0 < 800)
    fx.forEach((e) => {
      const p = (t - e.t0) / 420
      if (p < 0 || p > 1) return
      const sx = e.x * T + 16
      const sy = e.y * T + 16
      const tx = (e.x + e.dx) * T + 16
      const ty = (e.y + e.dy) * T + 16
      const col = HERO_COLORS[e.hero]
      ctx.save()
      ctx.lineCap = 'round'
      if (e.hero === 'guerrero') {
        const base = Math.atan2(e.dy, e.dx)
        const a0 = base - 1.2
        const a1 = a0 + 2.4 * Math.min(1, p * 1.4)
        ctx.globalAlpha = 1 - p * 0.6
        ctx.strokeStyle = col
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.arc(sx, sy, T * 0.95, a0, a1)
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(sx, sy, T * 0.95, a0 + 0.3, a1)
        ctx.stroke()
      } else if (e.hero === 'arquero') {
        const q = Math.min(1, p * 1.6)
        const ax = sx + (tx - sx) * q
        const ay = sy + (ty - sy) * q
        ctx.strokeStyle = '#d6b98c'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(ax - e.dx * 12, ay - e.dy * 12)
        ctx.lineTo(ax, ay)
        ctx.stroke()
        ctx.fillStyle = col
        ctx.fillRect(ax - 3, ay - 3, 6, 6)
        ctx.globalAlpha = 0.35
        ctx.strokeStyle = col
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ax, ay)
        ctx.stroke()
      } else if (e.hero === 'maga') {
        const q = Math.min(1, p * 1.5)
        const ox = sx + (tx - sx) * q
        const oy = sy + (ty - sy) * q
        const g = ctx.createRadialGradient(ox, oy, 1, ox, oy, 11)
        g.addColorStop(0, '#fff')
        g.addColorStop(0.4, '#c084fc')
        g.addColorStop(1, 'rgba(168,85,247,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(ox, oy, 11, 0, Math.PI * 2)
        ctx.fill()
        if (q >= 1) {
          const k = Math.min(1, (p - 0.66) / 0.34)
          ctx.globalAlpha = 1 - k
          ctx.strokeStyle = col
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(tx, ty, 4 + k * T * 0.8, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(tx, ty, 2 + k * T * 0.45, 0, Math.PI * 2)
          ctx.stroke()
        }
      } else {
        const q1 = Math.min(1, p * 2)
        const q2 = Math.max(0, Math.min(1, (p - 0.25) * 2))
        ctx.strokeStyle = col
        ctx.lineWidth = 4
        ctx.globalAlpha = 1 - p * 0.5
        ctx.beginPath()
        ctx.moveTo(tx - 12, ty - 12)
        ctx.lineTo(tx - 12 + 24 * q1, ty - 12 + 24 * q1)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(tx + 12, ty - 12)
        ctx.lineTo(tx + 12 - 24 * q2, ty - 12 + 24 * q2)
        ctx.stroke()
      }
      if (!e.miss && p > 0.55) {
        const k = (p - 0.55) / 0.45
        ctx.globalAlpha = 1 - k
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(tx, ty, 4 + k * 14, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    })
    parts = parts.filter((q) => t - q.t0 < q.life)
    parts.forEach((q) => {
      const a = t - q.t0
      if (a < 0) return
      const k = a / q.life
      ctx.globalAlpha = 1 - k
      ctx.fillStyle = q.c
      ctx.fillRect(q.x + q.vx * a * 0.06, q.y + q.vy * a * 0.06 + k * k * 14, 3, 3)
    })
    ctx.globalAlpha = 1
  }

  // s = { w, h, walls, gems, enemies, x, y, face }
  function draw(s, t, heroId) {
    if (canvas.width !== s.w * T || canvas.height !== s.h * T) {
      canvas.width = s.w * T
      canvas.height = s.h * T
    }
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = th.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const seed = x * 7 + y * 13 + levelIndex * 3 + 1
        if (s.walls.has(x + ',' + y)) drawWall(ctx, x * T, y * T, seed, th)
        else drawFloor(ctx, x * T, y * T, seed, th)
      }
    }
    const tc = getTorches(s)
    tc.forEach((c, i) => drawProp(ctx, c[0] * T, c[1] * T, t, i * 1.7 + 1, th))
    s.gems.forEach((k) => {
      const [x, y] = k.split(',').map(Number)
      drawGem(ctx, x * T, y * T, t, th)
    })
    s.enemies.forEach((k) => {
      const [x, y] = k.split(',').map(Number)
      drawEnemy(ctx, x * T, y * T, t, th)
    })
    dying = dying.filter((o) => t - o.t0 < 800)
    dying.forEach((o) => {
      const p = (t - o.t0) / 700
      let ox = 0
      let oy = 0
      let al = 1
      if (p > 0.4) {
        const q = (p - 0.4) / 0.6
        ox = o.dx * q * 14
        oy = o.dy * q * 14
        al = Math.max(0, 1 - q)
      }
      ctx.save()
      ctx.globalAlpha = al
      drawEnemy(ctx, o.x * T + ox, o.y * T + oy, t, th, p > 0.4 ? 5 : 4)
      ctx.restore()
    })
    // el héroe se lanza un poco hacia el enemigo al atacar
    let lx = 0
    let ly = 0
    fx.forEach((e) => {
      const p = (t - e.t0) / 420
      if (p >= 0 && p < 0.5) {
        const k = Math.sin((p / 0.5) * Math.PI) * 5
        lx += e.dx * k
        ly += e.dy * k
      }
    })
    // Héroe: sprite PNG por fotogramas (reposo o ataque), siempre en píxeles enteros para que no se vea borroso
    let frame = Math.floor(t / 260) % IDLE_FRAMES
    fx.forEach((e) => {
      const p = (t - e.t0) / 420
      if (p >= 0 && p < 1) frame = IDLE_FRAMES + Math.min(ATTACK_FRAMES - 1, Math.floor(p * ATTACK_FRAMES))
    })
    const hx = Math.round(s.x * T + lx)
    const hy = Math.round(s.y * T + ly)
    ctx.fillStyle = 'rgba(0,0,0,.30)'
    ctx.fillRect(hx + 8, hy + 29, 16, 2)
    ctx.fillRect(hx + 10, hy + 28, 12, 1)
    const sheet = heroSheet(heroId)
    if (sheet.complete && sheet.naturalWidth) {
      ctx.save()
      if (s.face === 1) {
        ctx.translate(hx + FRAME, hy)
        ctx.scale(-1, 1)
        ctx.drawImage(sheet, frame * FRAME, 0, FRAME, FRAME, 0, 0, FRAME, FRAME)
      } else {
        ctx.drawImage(sheet, frame * FRAME, 0, FRAME, FRAME, hx, hy, FRAME, FRAME)
      }
      ctx.restore()
    }
    lighting(s, t, tc)
    drawAmbient(ctx, canvas.width, canvas.height, t, th)
    drawFX(t)
  }

  return { draw, attack, clearEffects }
}
