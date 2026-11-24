// Dibujo de sprites y casillas (pixel art generado con código, sin imágenes).
import { PALETTE } from '../engine/heroes.js'

export const T = 32 // tamaño de casilla en el canvas

export function drawSprite(ctx, pixels, x, y, scale, flip = false) {
  for (let j = 0; j < 16; j++) {
    for (let i = 0; i < 16; i++) {
      const c = PALETTE[pixels[j][i]]
      if (!c) continue
      ctx.fillStyle = c
      ctx.fillRect(x + (flip ? 15 - i : i) * scale, y + j * scale, scale, scale)
    }
  }
}

export function rnd(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function drawFloor(ctx, x, y, seed, th) {
  const f = th.floor
  ctx.fillStyle = f[0]
  ctx.fillRect(x, y, T, T)
  ctx.fillStyle = f[1]
  ctx.fillRect(x + 1, y + 1, T - 2, T - 2)
  const r = rnd(seed)
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = r() > 0.5 ? f[2] : f[3]
    ctx.fillRect(x + 4 + Math.floor(r() * 22), y + 4 + Math.floor(r() * 22), 3, 2)
  }
  ctx.fillStyle = f[4]
  ctx.fillRect(x, y + T - 2, T, 2)
  ctx.fillRect(x + T - 2, y, 2, T)
  th.floorDeco(ctx, x, y, r)
}

// Muro con ladrillos; la paleta y el detalle cambian según el mundo
export function drawWall(ctx, x, y, seed, th) {
  ctx.fillStyle = th.mortar
  ctx.fillRect(x, y, T, T)
  const r = rnd(seed)
  const rows = [[0, 10], [10, 22], [22, 32]]
  rows.forEach((row, ri) => {
    const off = ri % 2 ? 8 : 0
    for (let bx = -off; bx < T; bx += 16) {
      const w = Math.min(15, T - Math.max(bx, 0))
      const sx = Math.max(bx, 0)
      ctx.fillStyle = th.bricks[Math.floor(r() * 3)]
      ctx.fillRect(x + sx, y + row[0] + 1, w, row[1] - row[0] - 2)
      ctx.fillStyle = 'rgba(255,255,255,.18)'
      ctx.fillRect(x + sx, y + row[0] + 1, w, 2)
      ctx.fillStyle = 'rgba(0,0,0,.25)'
      ctx.fillRect(x + sx, y + row[1] - 3, w, 2)
    }
  })
  th.wallDeco(ctx, x, y, r)
}

export function drawGem(ctx, x, y, t, th) {
  const b = Math.round(Math.sin(t / 200) * 2)
  const g = th.gem
  ctx.fillStyle = g[0]
  ctx.fillRect(x + 10, y + 8 + b, 12, 12)
  ctx.fillStyle = g[1]
  ctx.fillRect(x + 12, y + 10 + b, 4, 4)
  ctx.fillStyle = g[2]
  ctx.fillRect(x + 10, y + 18 + b, 12, 2)
}

export function drawEnemy(ctx, x, y, t, th) {
  const b = Math.round(Math.sin(t / 260) * 1.5)
  x = Math.round(x)
  y = Math.round(y)
  const e = th.enemy
  ctx.fillStyle = e[0]
  ctx.fillRect(x + 7, y + 8 + b, 18, 16)
  ctx.fillStyle = e[1]
  ctx.fillRect(x + 9, y + 10 + b, 14, 6)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x + 11, y + 12 + b, 4, 4)
  ctx.fillRect(x + 18, y + 12 + b, 4, 4)
  ctx.fillStyle = '#dc2626'
  ctx.fillRect(x + 12, y + 13 + b, 2, 2)
  ctx.fillRect(x + 19, y + 13 + b, 2, 2)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x + 12, y + 19 + b, 2, 3)
  ctx.fillRect(x + 18, y + 19 + b, 2, 3)
  ctx.fillStyle = e[2]
  ctx.fillRect(x + 7, y + 24, 18, 2)
}

// Antorcha (llama) o cristal luminoso según el mundo
export function drawProp(ctx, x, y, t, ph, th) {
  const f = th.flame
  if (th.prop === 'crystal') {
    const pulse = Math.sin(t / 320 + ph) > 0 ? 1 : 0
    ctx.fillStyle = '#2a2438'
    ctx.fillRect(x + 10, y + 24, 12, 3)
    const rows = [[15, 2], [14, 4], [13, 6], [13, 6], [13, 6], [13, 6], [14, 4]]
    rows.forEach(([rx, rw], i) => {
      ctx.fillStyle = i < 2 ? f[2] : i < 5 ? f[1] : f[0]
      ctx.fillRect(x + rx, y + 10 + i * 2, rw, 2)
    })
    ctx.fillStyle = pulse ? '#ffffff' : f[2]
    ctx.fillRect(x + 14, y + 14, 1, 5)
    return
  }
  ctx.fillStyle = '#2a1a0c'
  ctx.fillRect(x + 12, y + 12, 8, 3)
  ctx.fillStyle = '#4a3018'
  ctx.fillRect(x + 14, y + 14, 4, 12)
  const h = Math.round(8 + Math.sin(t / 70 + ph) * 1.5 + Math.sin(t / 31 + ph * 2) * 0.8)
  ctx.fillStyle = f[0]
  ctx.fillRect(x + 13, y + 12 - h, 6, h)
  ctx.fillStyle = f[1]
  ctx.fillRect(x + 14, y + 14 - h, 4, h - 2)
  ctx.fillStyle = f[2]
  const c = Math.round(h * 0.5)
  ctx.fillRect(x + 15, y + 12 - c, 2, c - 1)
}
