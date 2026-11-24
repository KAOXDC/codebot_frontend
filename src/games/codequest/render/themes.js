// Un tema visual por mundo: suelo, muros, props luminosos, iluminación y partículas ambientales.
import { rnd } from './sprites.js'

const dot = (ctx, c, x, y, w = 1, h = 1) => {
  ctx.fillStyle = c
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h)
}

export const THEMES = [
  {
    id: 'bosque', nombre: 'Bosque de los Primeros Pasos', accent: '#4ade80', banner: ['#14532d', '#1e3a2a'],
    bg: '#10240f',
    floor: ['#2d5a2a', '#3b7a35', '#4a9442', '#2f6a2c', '#234a21'],
    bricks: ['#1f6b34', '#2a8a44', '#237a3c'], mortar: '#12361d',
    prop: 'flame', flame: ['#f59e0b', '#fde047', '#fffbe6'], glow: 'rgba(255,220,110,.30)',
    dark: 0.36, darkRGB: '8,22,14', gem: ['#22d3ee', '#a5f3fc', '#0891b2'], enemy: ['#4d7c0f', '#65a30d', '#365314'], ambient: 'fireflies',
    floorDeco(ctx, x, y, r) {
      for (let i = 0; i < 3; i++) {
        const gx = x + 4 + Math.floor(r() * 22), gy = y + 5 + Math.floor(r() * 20)
        dot(ctx, '#5fd068', gx, gy, 1, 3); dot(ctx, '#7de88a', gx + 2, gy + 1, 1, 2)
      }
      if (r() > 0.7) { const fx = x + 6 + Math.floor(r() * 18), fy = y + 6 + Math.floor(r() * 18); dot(ctx, r() > 0.5 ? '#ffd23f' : '#ff7ab6', fx, fy, 2, 2); dot(ctx, '#fff', fx, fy) }
    },
    wallDeco(ctx, x, y, r) { for (let i = 0; i < 5; i++) dot(ctx, '#7de88a', x + 2 + Math.floor(r() * 26), y + 3 + Math.floor(r() * 24), 2, 1) },
  },
  {
    id: 'volcan', nombre: 'Volcán de las Decisiones', accent: '#fb923c', banner: ['#7c2d12', '#3a1a14'],
    bg: '#150a0a',
    floor: ['#2a1f26', '#3a2c34', '#4a3a44', '#2f2229', '#1a1217'],
    bricks: ['#2b1f25', '#3a2a31', '#33242b'], mortar: '#140c10',
    prop: 'flame', flame: ['#ef4444', '#ff9f1c', '#ffe066'], glow: 'rgba(255,110,40,.36)',
    dark: 0.58, darkRGB: '20,6,6', gem: ['#fde047', '#fef9c3', '#ca8a04'], enemy: ['#b91c1c', '#ef4444', '#7f1d1d'], ambient: 'embers',
    floorDeco(ctx, x, y, r) {
      if (r() > 0.55) {
        let cx = x + 4 + Math.floor(r() * 10), cy = y + 6 + Math.floor(r() * 16)
        for (let i = 0; i < 4; i++) { dot(ctx, '#ff7a1a', cx, cy, 3, 1); dot(ctx, '#ffd23f', cx + 1, cy, 1, 1); cx += 2 + Math.floor(r() * 3); cy += r() > 0.5 ? 1 : -1 }
      }
    },
    wallDeco(ctx, x, y, r) { const ry = y + 9 + Math.floor(r() * 3) * 8; dot(ctx, '#ff7a1a', x + 3 + Math.floor(r() * 8), ry, 10 + Math.floor(r() * 10), 1); dot(ctx, '#ffd23f', x + 6, ry, 3, 1) },
  },
  {
    id: 'oceano', nombre: 'Reino Submarino de los Ciclos', accent: '#22d3ee', banner: ['#155e75', '#0c2a40'],
    bg: '#06182b',
    floor: ['#1d6f86', '#27889e', '#3aa5b8', '#216f84', '#134f63'],
    bricks: ['#2f7f9a', '#3a93ad', '#33879f'], mortar: '#143a52',
    prop: 'crystal', flame: ['#0e7490', '#22d3ee', '#cffafe'], glow: 'rgba(60,220,255,.32)',
    dark: 0.46, darkRGB: '3,18,38', gem: ['#f472b6', '#fbcfe8', '#be185d'], enemy: ['#7c3aed', '#a78bfa', '#4c1d95'], ambient: 'bubbles',
    floorDeco(ctx, x, y, r) { for (let i = 0; i < 2; i++) dot(ctx, '#a8f0ee', x + 4 + Math.floor(r() * 20), y + 6 + Math.floor(r() * 20), 4, 1) },
    wallDeco(ctx, x, y, r) { if (r() > 0.4) { const cx = x + 4 + Math.floor(r() * 22); dot(ctx, '#ff6fa8', cx, y + 4, 1, 4); dot(ctx, '#ff6fa8', cx - 1, y + 4, 1, 1); dot(ctx, '#ff6fa8', cx + 1, y + 5, 1, 1) } },
  },
  {
    id: 'cielo', nombre: 'Ciudad en las Nubes', accent: '#fde047', banner: ['#1e40af', '#0f2a66'],
    bg: '#6f9be0',
    floor: ['#7ea6e8', '#9bbcf0', '#bcd3fa', '#8fb2ec', '#6c92d6'],
    bricks: ['#f3efe4', '#e6e0d0', '#fbf8ef'], mortar: '#b8b2a0',
    prop: 'crystal', flame: ['#ca8a04', '#fde047', '#fffbe6'], glow: 'rgba(255,240,150,.26)',
    dark: 0.1, darkRGB: '90,120,200', gem: ['#a78bfa', '#ddd6fe', '#6d28d9'], enemy: ['#64748b', '#94a3b8', '#334155'], ambient: 'sparkles',
    floorDeco(ctx, x, y, r) { for (let i = 0; i < 2; i++) { const px = x + 5 + Math.floor(r() * 18), py = y + 6 + Math.floor(r() * 18); dot(ctx, '#ffffff', px, py, 5, 2); dot(ctx, '#ffffff', px + 1, py - 1, 3, 1) } },
    wallDeco(ctx, x, y) { dot(ctx, '#e0a526', x, y + 1, 32, 1) },
  },
  {
    id: 'hielo', nombre: 'Montaña Helada de las Funciones', accent: '#93c5fd', banner: ['#1e3a8a', '#0e1f45'],
    bg: '#0e1c33',
    floor: ['#8fbfe6', '#b3d9f5', '#d4ecff', '#9cc8ea', '#6b9fc9'],
    bricks: ['#a8d8f5', '#bfe6ff', '#92c6ea'], mortar: '#5b8fb8',
    prop: 'crystal', flame: ['#3b82f6', '#93c5fd', '#eff6ff'], glow: 'rgba(130,190,255,.34)',
    dark: 0.36, darkRGB: '6,18,48', gem: ['#fb923c', '#fed7aa', '#c2410c'], enemy: ['#0891b2', '#67e8f9', '#164e63'], ambient: 'snow',
    floorDeco(ctx, x, y, r) {
      if (r() > 0.5) { let cx = x + 5 + Math.floor(r() * 12), cy = y + 5 + Math.floor(r() * 12); for (let i = 0; i < 5; i++) { dot(ctx, '#ffffff', cx, cy); cx++; cy += i % 2 } }
      dot(ctx, '#ffffff', x + 6 + Math.floor(r() * 20), y + 6 + Math.floor(r() * 20), 1, 1)
    },
    wallDeco(ctx, x, y, r) { dot(ctx, '#ffffff', x + 3 + Math.floor(r() * 24), y + 3, 3, 1); dot(ctx, '#e6f6ff', x + 6 + Math.floor(r() * 18), y + 14, 2, 1) },
  },
  {
    id: 'castillo', nombre: 'Castillo del Jefe Final', accent: '#c084fc', banner: ['#4c1d95', '#1f1235'],
    bg: '#14101e',
    floor: ['#3b3550', '#463f5e', '#4f4869', '#3f3957', '#2e2942'],
    bricks: ['#7b7490', '#6f6985', '#847d9a'], mortar: '#2a2438',
    prop: 'flame', flame: ['#ef4444', '#ff9f1c', '#ffe066'], glow: 'rgba(255,150,50,.30)',
    dark: 0.8, darkRGB: '6,4,14', gem: ['#22d3ee', '#a5f3fc', '#0891b2'], enemy: ['#6d28d9', '#8b5cf6', '#3b0764'], ambient: 'wisps',
    floorDeco() {},
    wallDeco(ctx, x, y, r) { if (r() > 0.6) { dot(ctx, '#4f8a4a', x + 4, y + 24, 6, 4); dot(ctx, '#4f8a4a', x + 8, y + 22, 4, 3) } },
  },
]

export const themeOf = (world) => THEMES[world] || THEMES[5]

// Partículas ambientales: posiciones calculadas solo con el tiempo (sin estado) y en píxeles enteros.
export function drawAmbient(ctx, W, H, t, th) {
  const r = rnd(41)
  const n = 18
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, sp = 0.4 + r() * 0.9, ph = r() * 6.28
    const k = th.ambient
    if (k === 'fireflies') {
      const x = x0 + Math.sin(t / 900 + ph) * 14, y = y0 + Math.cos(t / 1100 + ph) * 10
      const a = 0.35 + 0.65 * Math.max(0, Math.sin(t / 420 + ph)); ctx.globalAlpha = a
      dot(ctx, '#e9ff7a', x, y, 2, 2); ctx.globalAlpha = a * 0.35; dot(ctx, '#e9ff7a', x - 1, y - 1, 4, 4)
    } else if (k === 'embers') {
      const y = H - ((t * 0.02 * sp + y0) % H), x = x0 + Math.sin(t / 700 + ph) * 6
      ctx.globalAlpha = Math.min(1, y / (H * 0.4)); dot(ctx, i % 3 ? '#ff9f1c' : '#ffe066', x, y, 2, 2)
    } else if (k === 'bubbles') {
      const y = H - ((t * 0.018 * sp + y0) % H), x = x0 + Math.sin(t / 800 + ph) * 5
      ctx.globalAlpha = 0.7; ctx.fillStyle = '#d8fbff'; ctx.fillRect(Math.floor(x), Math.floor(y), 3, 1); ctx.fillRect(Math.floor(x), Math.floor(y) + 2, 3, 1); ctx.fillRect(Math.floor(x) - 1, Math.floor(y) + 1, 1, 1); ctx.fillRect(Math.floor(x) + 3, Math.floor(y) + 1, 1, 1)
    } else if (k === 'sparkles') {
      const a = Math.max(0, Math.sin(t / 500 + ph)); ctx.globalAlpha = a
      dot(ctx, '#ffffff', x0, y0, 1, 3); dot(ctx, '#ffffff', x0 - 1, y0 + 1, 3, 1)
    } else if (k === 'snow') {
      const y = (t * 0.02 * sp + y0) % H, x = x0 + Math.sin(t / 900 + ph) * 8
      ctx.globalAlpha = 0.9; dot(ctx, '#ffffff', x, y, 2, 2)
    } else {
      const x = (x0 + t * 0.008 * sp) % W, y = y0 + Math.sin(t / 1000 + ph) * 8
      ctx.globalAlpha = 0.25 + 0.4 * Math.max(0, Math.sin(t / 700 + ph)); dot(ctx, '#c084fc', x, y, 2, 2)
    }
  }
  ctx.globalAlpha = 1
}
