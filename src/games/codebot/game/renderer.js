import { drawChar } from './drawChar.js';
import { TEMAS, dibujarFondo } from './escenarios.js';

const TW = 76;
const TH = 38;
const HH = 20;

function poly(ctx, pts, fill) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

const grad = (ctx, x0, y0, x1, y1, a, b) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
};

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

// Elipse aplastada con degradado radial (sombras y charcos de luz sin filtros costosos)
function mancha(ctx, cx, cy, rx, ry, color0, color1 = 'rgba(0,0,0,0)') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, rx);
  g.addColorStop(0, color0);
  g.addColorStop(1, color1);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, 7);
  ctx.fill();
  ctx.restore();
}

function dibujarRobot(ctx, G, level, view, gender, t) {
  const hA = alturaEn(level, Math.round(view.fx), Math.round(view.fy));
  const hB = alturaEn(level, Math.round(view.tx), Math.round(view.ty));
  const h = hA + (hB - hA) * view.e;
  const px = ((view.cx - view.cy) * TW) / 2 + G.ox;
  const py = ((view.cx + view.cy) * TH) / 2 - h * HH + G.oy;
  const salto = view.mode === 'jump' ? Math.sin(view.p * Math.PI) * 26 : 0;
  mancha(ctx, px, py + 8, 20 - salto * 0.2, 8, `rgba(0,0,0,${0.38 - salto * 0.006})`);
  drawChar(ctx, px, py + 4, { g: gender, dir: view.dir, t, mode: view.mode, p: view.p, s: 1 });
  view.sx = px;
  view.sy = py;
}

// Dibuja el escenario de la temática, el tablero isométrico, las bombillas, el robot y las partículas
export function renderScene(ctx, canvas, level, view, particles, gender, time) {
  const w = canvas.width;
  const h = canvas.height;
  const G = geometria(level, w, h);
  const t = time / 1000;
  const th = TEMAS[level.t] || TEMAS[0];
  const reducir = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  dibujarFondo(ctx, w, h, th, reducir ? 0 : t);

  // sombra proyectada de la plataforma sobre el "suelo" del escenario
  for (let y = 0; y < G.H; y++) {
    for (let x = 0; x < level.g[y].length; x++) {
      if (level.g[y][x] === '.') continue;
      mancha(ctx, ((x - y) * TW) / 2 + G.ox, ((x + y) * TH) / 2 + G.oy + 58, TW * 0.8, TH * 0.8, 'rgba(0,0,0,.30)');
    }
  }

  // de atrás hacia adelante (por x+y) para que el robot quede bien tapado
  // Casilla que "ordena" al robot: mientras camina o salta, pasa a la casilla destino un poco ANTES
  // de la mitad, para que la baldosa de adelante no lo tape y luego lo suelte de golpe.
  const moviendo = (view.mode === 'walk' || view.mode === 'jump') && (view.fx !== view.tx || view.fy !== view.ty);
  const adelante = moviendo && view.e > 0.22;
  const robotX = moviendo ? (adelante ? view.tx : view.fx) : Math.round(view.cx);
  const robotY = moviendo ? (adelante ? view.ty : view.fy) : Math.round(view.cy);
  let robotDibujado = false;
  for (let suma = 0; suma <= G.W + G.H; suma++) {
    for (let y = 0; y < G.H; y++) {
      const x = suma - y;
      if (x < 0 || x >= level.g[y].length) continue;
      const c = level.g[y][x];
      if (c === '.') continue;
      const alto = +c;
      const cx = ((x - y) * TW) / 2 + G.ox;
      const cy = ((x + y) * TH) / 2 - alto * HH + G.oy;
      const sh = alto * HH + 14;
      const azul = level.blue.some((p) => p[0] === x && p[1] === y);
      const Lc = azul ? ['#3b82f6', '#1e3a8a'] : th.L;
      const Rc = azul ? ['#2563eb', '#172554'] : th.R;

      poly(ctx, [[cx - TW / 2, cy], [cx, cy + TH / 2], [cx, cy + TH / 2 + sh], [cx - TW / 2, cy + sh]], grad(ctx, cx, cy, cx, cy + sh, Lc[0], Lc[1]));
      poly(ctx, [[cx + TW / 2, cy], [cx, cy + TH / 2], [cx, cy + TH / 2 + sh], [cx + TW / 2, cy + sh]], grad(ctx, cx, cy, cx, cy + sh, Rc[0], Rc[1]));
      // franja luminosa en el borde inferior
      ctx.save();
      ctx.strokeStyle = azul ? th.blue : th.acc;
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx - TW / 2, cy + sh - 2);
      ctx.lineTo(cx, cy + TH / 2 + sh - 2);
      ctx.lineTo(cx + TW / 2, cy + sh - 2);
      ctx.stroke();
      ctx.restore();
      // cara superior con degradado, borde iluminado y trazo de panel
      poly(ctx, [[cx, cy - TH / 2], [cx + TW / 2, cy], [cx, cy + TH / 2], [cx - TW / 2, cy]],
        azul ? grad(ctx, cx, cy - TH / 2, cx, cy + TH / 2, '#93c5fd', '#3b82f6') : grad(ctx, cx, cy - TH / 2, cx, cy + TH / 2, th.top[0], th.top[1]));
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx - TW / 2, cy); ctx.lineTo(cx, cy - TH / 2); ctx.lineTo(cx + TW / 2, cy); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.14)';
      ctx.beginPath(); ctx.moveTo(cx + TW * 0.41, cy); ctx.lineTo(cx, cy + TH * 0.41); ctx.lineTo(cx - TW * 0.41, cy); ctx.stroke();
      if (azul) {
        ctx.save();
        ctx.strokeStyle = th.blue; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.55 + 0.4 * Math.sin(t * 3);
        ctx.shadowColor = th.blue; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.ellipse(cx, cy, TW * 0.28, TH * 0.28, 0, 0, 7); ctx.stroke();
        ctx.restore();
      }

      // bombilla con pedestal, cristal y, si está encendida, charco y cono de luz
      if (level.l.some((p) => p[0] === x && p[1] === y)) {
        const on = view.lit.includes(x + ',' + y);
        mancha(ctx, cx, cy + 2, 13, 6, 'rgba(0,0,0,.35)');
        ctx.fillStyle = grad(ctx, cx - 8, 0, cx + 8, 0, '#64748b', '#1e293b');
        ctx.fillRect(cx - 7, cy - 9, 14, 10);
        if (on) {
          mancha(ctx, cx, cy, TW * 0.5, TW * 0.25, 'rgba(253,224,71,.75)', 'rgba(253,224,71,0)');
          poly(ctx, [[cx - 8, cy - 14], [cx + 8, cy - 14], [cx + 26, cy - 64], [cx - 26, cy - 64]], grad(ctx, 0, cy - 60, 0, cy - 10, 'rgba(253,224,71,0)', 'rgba(253,224,71,.35)'));
          const pulso = 1 + Math.sin(t * 5) * 0.06;
          const gl = ctx.createRadialGradient(cx, cy - 20, 2, cx, cy - 20, 38 * pulso);
          gl.addColorStop(0, 'rgba(253,224,71,.9)'); gl.addColorStop(1, 'rgba(253,224,71,0)');
          ctx.fillStyle = gl;
          ctx.beginPath(); ctx.arc(cx, cy - 20, 38 * pulso, 0, 7); ctx.fill();
        }
        const bl = ctx.createRadialGradient(cx - 3, cy - 24, 2, cx, cy - 20, 12);
        bl.addColorStop(0, on ? '#fffbe0' : '#f1f5f9'); bl.addColorStop(1, on ? '#facc15' : '#94a3b8');
        ctx.fillStyle = bl;
        ctx.beginPath(); ctx.arc(cx, cy - 20, 11, 0, 7); ctx.fill();
        ctx.strokeStyle = on ? '#f59e0b' : '#64748b'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath(); ctx.ellipse(cx - 4, cy - 24, 3, 2, -0.6, 0, 7); ctx.fill();
      }

      if (!robotDibujado && robotX === x && robotY === y) {
        dibujarRobot(ctx, G, level, view, gender, t);
        robotDibujado = true;
      }
    }
  }
  if (!robotDibujado) dibujarRobot(ctx, G, level, view, gender, t);

  // viñeta suave para centrar la mirada
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  // partículas (se actualizan en el mismo arreglo)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.02;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.s, p.s);
  }
  ctx.globalAlpha = 1;
}
