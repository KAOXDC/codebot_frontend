// Un escenario por temática: 0 Laboratorio · 1 Taller · 2 Circuito · 3 Ciudad nocturna
export const TEMAS = [
  { n: 'Laboratorio', sky: ['#e6f9ff', '#a9dcf3', '#7fb8e6'], top: ['#ffffff', '#e3f1fb'], L: ['#9fc4e0', '#5c8ab5'], R: ['#7ba6c9', '#43709b'], acc: '#22d3ee', blue: '#3b82f6', fog: 'rgba(255,255,255,.45)', fondo: 'lab' },
  { n: 'Taller', sky: ['#2a1646', '#5b2a86', '#c0568a'], top: ['#f4e9ff', '#d9c3f0'], L: ['#8d6bb5', '#4c2d78'], R: ['#6e4c97', '#33195a'], acc: '#fb923c', blue: '#6366f1', fog: 'rgba(0,0,0,.35)', fondo: 'gears' },
  { n: 'Circuito', sky: ['#04181f', '#0a3b42', '#12706a'], top: ['#d9fff4', '#9ee8d2'], L: ['#3f9c8b', '#1b5d55'], R: ['#2c7f72', '#0f4640'], acc: '#34d399', blue: '#22d3ee', fog: 'rgba(0,0,0,.35)', fondo: 'rings' },
  { n: 'Ciudad nocturna', sky: ['#080c26', '#241a5e', '#5b3a9a'], top: ['#e8e4ff', '#b9b0e8'], L: ['#6a5fb0', '#2f2a6e'], R: ['#4d4491', '#1f1b52'], acc: '#f472b6', blue: '#38bdf8', fog: 'rgba(0,0,0,.35)', fondo: 'city' },
];

// Aleatorio determinista (el fondo no "parpadea" entre cuadros)
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function dibujarFondo(ctx, w, h, th, t) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  if (th.fondo === 'lab') {
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * 20, h * 0.55); ctx.lineTo(w / 2 + i * 95, h); ctx.stroke(); }
    for (let j = 0; j < 7; j++) { const y = h * 0.55 + Math.pow(j / 6, 2) * h * 0.45; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    [[70, 70, '1'], [130, 110, '2'], [w - 100, 80, '3'], [w - 50, 130, '4']].forEach(([x, y, s], i) => {
      const o = Math.sin(t * 1.2 + i) * 5;
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.strokeStyle = 'rgba(34,211,238,.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x, y + o, 44, 34, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0e7490'; ctx.font = 'bold 20px monospace'; ctx.fillText(s, x + 16, y + o + 24);
    });
  } else if (th.fondo === 'gears') {
    [[80, 80, 46, 1], [150, 130, 30, -1], [w - 80, 90, 52, -1], [w - 140, 150, 28, 1]].forEach(([x, y, r, d], i) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.35 * d + i);
      ctx.fillStyle = 'rgba(251,146,60,.20)'; ctx.strokeStyle = 'rgba(251,146,60,.55)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283; const rr = k % 2 ? r * 0.82 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, 7); ctx.stroke();
      ctx.restore();
    });
  } else if (th.fondo === 'rings') {
    ctx.translate(w / 2, h * 0.46);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(52,211,153,${0.35 - i * 0.05})`; ctx.lineWidth = 2;
      ctx.setLineDash([14 + i * 8, 10]); ctx.lineDashOffset = -t * 20 * (i % 2 ? 1 : -1);
      ctx.beginPath(); ctx.ellipse(0, 0, 110 + i * 55, (110 + i * 55) * 0.5, 0, 0, 7); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = 'rgba(34,211,238,.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = 30 + i * 60;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(50 + rnd(i) * 70, y); ctx.lineTo(70 + rnd(i) * 70, y + 16); ctx.lineTo(120, y + 16); ctx.stroke();
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(116, y + 13, 6, 6);
    }
  } else if (th.fondo === 'city') {
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))})`; ctx.fillRect(rnd(i) * w, rnd(i + 9) * h * 0.5, 1.6, 1.6); }
    const sk = (c, base, mh, seed, ventanas) => {
      let x = -10;
      while (x < w) {
        const bw = 28 + rnd(x + seed) * 40; const bh = mh * (0.4 + rnd(x * 3 + seed) * 0.6);
        ctx.fillStyle = c; ctx.fillRect(x, base - bh, bw, bh + 200);
        if (ventanas) {
          for (let yy = base - bh + 8; yy < base - 6; yy += 12) for (let xx = x + 5; xx < x + bw - 6; xx += 10) {
            if (rnd(xx * 7 + yy) > 0.62) { ctx.fillStyle = rnd(xx + yy) > 0.5 ? 'rgba(244,114,182,.75)' : 'rgba(56,189,248,.75)'; ctx.fillRect(xx, yy, 4, 5); }
          }
        }
        x += bw + 4;
      }
    };
    sk('#16123f', h * 0.62, 150, 1, true); sk('#0c0a2a', h * 0.7, 110, 5, false);
  }
  // niebla inferior para dar profundidad
  const f = ctx.createLinearGradient(0, h * 0.6, 0, h);
  f.addColorStop(0, 'rgba(255,255,255,0)'); f.addColorStop(1, th.fog);
  ctx.fillStyle = f; ctx.fillRect(0, h * 0.6, w, h * 0.4);
  ctx.restore();
  // motas de luz que suben despacio
  for (let i = 0; i < 18; i++) {
    const x = (rnd(i) * w + t * (6 + rnd(i + 3) * 10)) % w;
    const y = h - ((rnd(i + 5) * h + t * (10 + rnd(i + 7) * 14)) % h);
    ctx.fillStyle = th.acc; ctx.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(t + i));
    ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
