import { DX, DY } from './interpreter.js';

// Dibuja al robot (chico azul con antena o chica rosa con moño y coleta).
// o = { g: 'm'|'f', dir, t (tiempo en s), mode: idle|walk|turn|jump|cheer|sad|bulb, p (0-1), s (escala) }
export function drawChar(c, x, y, o) {
  const g = o.g;
  const t = o.t || 0;
  const p = o.p || 0;
  const mode = o.mode || 'idle';
  const s = o.s || 1;
  const body = g === 'f' ? '#ec4899' : '#3b82f6';
  const dark = g === 'f' ? '#be185d' : '#1d4ed8';
  const light = g === 'f' ? '#f9a8d4' : '#93c5fd';

  // En la vista isométrica, mirar hacia arriba (dirs 0 y 3) = dar la espalda a la cámara
  const back = DX[o.dir] + DY[o.dir] < 0;

  let bob = Math.sin(t * 2.2) * 1.6;
  let squash = 1;
  let lift = 0;
  let tilt = 0;
  let armL = 0;
  let armR = 0;
  if (mode === 'walk') { bob = -Math.abs(Math.sin(p * Math.PI)) * 7; armL = Math.sin(p * Math.PI * 2) * 0.8; armR = -armL; }
  if (mode === 'turn') { tilt = Math.sin(p * Math.PI) * 0.18; }
  if (mode === 'jump') { lift = Math.sin(p * Math.PI) * 26; squash = 1 + Math.sin(p * Math.PI) * 0.08; armL = -1; armR = -1; }
  if (mode === 'cheer') { bob = -Math.abs(Math.sin(t * 7)) * 10; armL = -1.9 + Math.sin(t * 14) * 0.35; armR = -1.9 - Math.sin(t * 14) * 0.35; }
  if (mode === 'sad') { bob = 3; tilt = Math.sin(t * 3) * 0.03; armL = 0.5; armR = 0.5; }
  if (mode === 'bulb') { armL = -1.4 * Math.sin(p * Math.PI); armR = armL; bob = -Math.sin(p * Math.PI) * 4; }

  c.save();
  c.translate(x, y);
  c.scale(s, s);
  // sombra (se achica al saltar)
  c.fillStyle = 'rgba(30,41,59,.18)';
  c.beginPath();
  c.ellipse(0, 2, 17 - lift * 0.2, 7 - lift * 0.08, 0, 0, 7);
  c.fill();
  c.translate(0, -lift + bob * 0.5);
  c.rotate(tilt);
  c.scale(1 / squash, squash);
  // al girar, el cuerpo se "estrecha" a mitad del giro para dar sensación de volteo
  if (mode === 'turn') c.scale(0.35 + 0.65 * Math.abs(Math.cos(p * Math.PI)), 1);

  // brazos
  const brazo = (sx, a) => {
    c.save();
    c.translate(sx * 15, -24);
    c.rotate(sx * (0.25 + a));
    c.fillStyle = dark;
    c.beginPath();
    c.roundRect(-3.5, -1, 7, 17, 4);
    c.fill();
    c.fillStyle = light;
    c.beginPath();
    c.arc(0, 16, 4, 0, 7);
    c.fill();
    c.restore();
  };
  brazo(-1, armL);
  brazo(1, armR);

  // piernas
  const ph = mode === 'walk' ? Math.sin(p * Math.PI * 2) * 5 : 0;
  c.fillStyle = dark;
  c.beginPath();
  c.roundRect(-9, -9, 7, 10 + ph * 0.3, 3);
  c.fill();
  c.beginPath();
  c.roundRect(2, -9, 7, 10 - ph * 0.3, 3);
  c.fill();

  // cuerpo
  c.fillStyle = body;
  c.beginPath();
  c.roundRect(-14, -38, 28, 32, 9);
  c.fill();
  if (back) {
    // espalda: panel con rejilla
    c.fillStyle = dark;
    c.beginPath();
    c.roundRect(-9, -33, 18, 16, 5);
    c.fill();
    c.fillStyle = light;
    [-29, -25, -21].forEach((yy) => c.fillRect(-5, yy, 10, 2));
  } else {
    c.fillStyle = light;
    c.beginPath();
    c.roundRect(-8, -30, 16, 12, 5);
    c.fill();
    c.fillStyle = dark;
    c.beginPath();
    c.arc(0, -24, 3, 0, 7);
    c.fill();
  }
  if (g === 'f') {
    c.fillStyle = dark;
    c.beginPath();
    c.moveTo(-14, -14);
    c.lineTo(14, -14);
    c.lineTo(18, -6);
    c.lineTo(-18, -6);
    c.closePath();
    c.fill();
  }

  // cabeza
  c.fillStyle = back ? '#e2e8f0' : '#f8fafc';
  c.strokeStyle = dark;
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(-13, -58, 26, 22, 9);
  c.fill();
  c.stroke();

  if (!back) {
    // cara (solo si mira hacia la cámara); se desplaza hacia el lado al que mira
    const fx = (DX[o.dir] - DY[o.dir]) * 3.2;
    const blink = Math.sin(t * 1.3) > 0.97 && mode === 'idle';
    const ey = mode === 'sad' ? -46 : -48;
    c.fillStyle = '#0f172a';
    if (mode === 'cheer' || mode === 'bulb') {
      c.strokeStyle = '#0f172a';
      c.lineWidth = 2.2;
      c.lineCap = 'round';
      [-5, 5].forEach((ex) => {
        c.beginPath();
        c.arc(ex + fx, ey + 2, 3, Math.PI * 1.1, Math.PI * 1.9);
        c.stroke();
      });
    } else if (blink) {
      c.fillRect(-8 + fx, ey, 6, 1.6);
      c.fillRect(2 + fx, ey, 6, 1.6);
    } else {
      c.beginPath();
      c.arc(-5 + fx, ey, 2.8, 0, 7);
      c.arc(5 + fx, ey, 2.8, 0, 7);
      c.fill();
    }
    if (g === 'f' && !blink) {
      c.strokeStyle = '#0f172a';
      c.lineWidth = 1.4;
      [[-5, -1], [5, 1]].forEach(([ex, d]) => {
        c.beginPath();
        c.moveTo(ex + fx + d * 2.5, ey - 2.5);
        c.lineTo(ex + fx + d * 5, ey - 4.5);
        c.stroke();
      });
    }
    // boca
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1.8;
    c.lineCap = 'round';
    c.beginPath();
    if (mode === 'sad') c.arc(fx, -38, 4, Math.PI * 1.15, Math.PI * 1.85);
    else c.arc(fx, -43.5, 4, Math.PI * 0.15, Math.PI * 0.85);
    c.stroke();
    if (mode === 'sad') {
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.ellipse(8 + fx, -42 + ((t * 30) % 10), 1.6, 2.6, 0, 0, 7);
      c.fill();
    }
  } else {
    // espalda: casco liso con rejilla; la chica muestra su coleta
    c.fillStyle = light;
    c.beginPath();
    c.roundRect(-8, -54, 16, 12, 5);
    c.fill();
    c.strokeStyle = dark;
    c.lineWidth = 1.6;
    c.lineCap = 'round';
    [-51, -47, -43].forEach((yy) => {
      c.beginPath();
      c.moveTo(-5, yy);
      c.lineTo(5, yy);
      c.stroke();
    });
    if (g === 'f') {
      const sw = Math.sin(t * 3) * 3;
      c.fillStyle = dark;
      c.beginPath();
      c.ellipse(sw * 0.5, -36, 5.5, 11, sw * 0.05, 0, 7);
      c.fill();
    }
  }

  // antena (chico) o moño (chica)
  if (g === 'm') {
    c.strokeStyle = dark;
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(0, -58);
    c.lineTo(0, -67);
    c.stroke();
    c.fillStyle = mode === 'cheer' || mode === 'bulb' ? '#fde047' : '#f43f5e';
    c.beginPath();
    c.arc(0, -69, 3.6 + Math.sin(t * 5) * 0.5, 0, 7);
    c.fill();
  } else {
    c.fillStyle = '#f43f5e';
    c.beginPath();
    c.moveTo(0, -61);
    c.lineTo(-10, -68);
    c.lineTo(-10, -55);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(0, -61);
    c.lineTo(10, -68);
    c.lineTo(10, -55);
    c.closePath();
    c.fill();
    c.fillStyle = '#be123c';
    c.beginPath();
    c.arc(0, -61, 3, 0, 7);
    c.fill();
  }
  c.restore();
}
