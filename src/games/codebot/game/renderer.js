import { drawChar } from './drawChar.js';

const TW = 76;
const TH = 38;
const HH = 20;

function poly(ctx, pts, fill, stroke) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke || 'rgba(30,41,59,.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function geometria(level, w, h) {
  const H = level.g.length;
  const W = Math.max(...level.g.map((r) => r.length));
  const maxh = Math.max(...level.g.join('').replace(/\./g, '').split('').map(Number));
  return {
    W,
    H,
    ox: w / 2 - ((W - H) / 2) * (TW / 2),
    oy: h / 2 - ((W + H - 2) * TH) / 4 + (maxh * HH) / 2 + 14,
  };
}

const alturaEn = (level, x, y) => {
  const c = (level.g[y] || '')[x];
  return c === undefined || c === '.' ? 0 : +c;
};

function dibujarRobot(ctx, G, level, view, gender, t) {
  const hA = alturaEn(level, Math.round(view.fx), Math.round(view.fy));
  const hB = alturaEn(level, Math.round(view.tx), Math.round(view.ty));
  const h = hA + (hB - hA) * view.e;
  const px = ((view.cx - view.cy) * TW) / 2 + G.ox;
  const py = ((view.cx + view.cy) * TH) / 2 - h * HH + G.oy;
  drawChar(ctx, px, py + 4, { g: gender, dir: view.dir, t, mode: view.mode, p: view.p, s: 1 });
  view.sx = px;
  view.sy = py;
}

// Dibuja el tablero isométrico, las bombillas, el robot y las partículas
export function renderScene(ctx, canvas, level, view, particles, gender, time) {
  const G = geometria(level, canvas.width, canvas.height);
  const t = time / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // nubes suaves de fondo
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  [[90, 70, 34], [130, 62, 26], [520, 100, 30], [560, 92, 22]].forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx + Math.sin(t * 0.3 + cx) * 6, cy, r, 0, 7);
    ctx.fill();
  });

  // de atrás hacia adelante (por x+y) para que el robot quede bien tapado
  const robotX = Math.round(view.cx);
  const robotY = Math.round(view.cy);
  let robotDibujado = false;
  for (let suma = 0; suma <= G.W + G.H; suma++) {
    for (let y = 0; y < G.H; y++) {
      const x = suma - y;
      if (x < 0 || x >= level.g[y].length) continue;
      const c = level.g[y][x];
      if (c === '.') continue;
      const h = +c;
      const cx = ((x - y) * TW) / 2 + G.ox;
      const cy = ((x + y) * TH) / 2 - h * HH + G.oy;
      const sh = h * HH + 14;
      const esAzul = level.blue.some((p) => p[0] === x && p[1] === y);

      poly(ctx, [[cx - TW / 2, cy], [cx, cy + TH / 2], [cx, cy + TH / 2 + sh], [cx - TW / 2, cy + sh]], esAzul ? '#2563eb' : '#94a3b8');
      poly(ctx, [[cx + TW / 2, cy], [cx, cy + TH / 2], [cx, cy + TH / 2 + sh], [cx + TW / 2, cy + sh]], esAzul ? '#1d4ed8' : '#64748b');
      poly(ctx, [[cx, cy - TH / 2], [cx + TW / 2, cy], [cx, cy + TH / 2], [cx - TW / 2, cy]], esAzul ? '#60a5fa' : '#f1f5f9');

      if (level.l.some((p) => p[0] === x && p[1] === y)) {
        const encendida = view.lit.includes(x + ',' + y);
        const pulso = encendida ? 1 + Math.sin(t * 5) * 0.08 : 1;
        if (encendida) {
          const gr = ctx.createRadialGradient(cx, cy - 6, 2, cx, cy - 6, 34);
          gr.addColorStop(0, 'rgba(253,224,71,.85)');
          gr.addColorStop(1, 'rgba(253,224,71,0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(cx, cy - 6, 34, 0, 7);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy - 7, (encendida ? 11 : 8) * pulso, 0, 7);
        ctx.fillStyle = encendida ? '#fde047' : '#cbd5e1';
        ctx.fill();
        ctx.strokeStyle = encendida ? '#f59e0b' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = encendida ? '#f59e0b' : '#94a3b8';
        ctx.fillRect(cx - 4, cy + 1, 8, 4);
      }

      if (!robotDibujado && robotX === x && robotY === y) {
        dibujarRobot(ctx, G, level, view, gender, t);
        robotDibujado = true;
      }
    }
  }
  if (!robotDibujado) dibujarRobot(ctx, G, level, view, gender, t);

  // partículas (se actualizan en el mismo arreglo)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life -= 0.02;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.s, p.s);
  }
  ctx.globalAlpha = 1;
}
