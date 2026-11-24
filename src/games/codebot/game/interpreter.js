// Direcciones: 0 = arriba, 1 = derecha, 2 = abajo, 3 = izquierda (en el tablero)
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

// Mensajes para el estudiante según el motivo del fallo
export const MENSAJES = {
  sin_bombilla: '❌ Ahí no hay bombilla 💡',
  bucle_infinito: '❌ Demasiados pasos: ¿bucle infinito? ♾️',
  faltan_bombillas: '💡 Aún faltan bombillas. ¡Inténtalo otra vez!',
};

class ErrorPrograma extends Error {
  constructor(codigo) {
    super(codigo);
    this.codigo = codigo;
  }
}

// Ejecuta el programa y devuelve la lista de eventos a animar.
// prog = { main: [{t, n}], f1: [...], f2: [...] }
export function simular(level, prog) {
  let [x, y, d] = level.s;
  const lit = new Set();
  const ev = [];
  let pasos = 0;
  let codigo = null;

  const alt = (a, b) => {
    const c = (level.g[b] || '')[a];
    return c === undefined || c === '.' ? null : +c;
  };
  const azul = () => level.blue.some((p) => p[0] === x && p[1] === y);

  function actuar(b) {
    if (b.t === 'F' || b.t === 'J') {
      const nx = x + DX[d];
      const ny = y + DY[d];
      const a = alt(x, y);
      const c = alt(nx, ny);
      const puede = c !== null && (b.t === 'F' ? c === a : Math.abs(c - a) === 1);
      if (puede) {
        ev.push({ k: b.t === 'J' ? 'jump' : 'walk', fx: x, fy: y, tx: nx, ty: ny, d, lit: [...lit] });
        x = nx;
        y = ny;
      } else {
        ev.push({ k: 'bump', fx: x, fy: y, tx: x, ty: y, d, lit: [...lit] });
      }
    } else if (b.t === 'L' || b.t === 'R') {
      const antes = d;
      d = (d + (b.t === 'L' ? 3 : 1)) % 4;
      ev.push({ k: 'turn', fx: x, fy: y, tx: x, ty: y, d: antes, d2: d, lit: [...lit] });
    } else if (b.t === 'B') {
      if (level.l.some((p) => p[0] === x && p[1] === y)) {
        // Encender sobre una bombilla que ya está encendida la apaga (interruptor)
        const clave = x + ',' + y;
        const off = lit.has(clave);
        if (off) lit.delete(clave);
        else lit.add(clave);
        ev.push({ k: 'bulb', fx: x, fy: y, tx: x, ty: y, d, lit: [...lit], off });
      } else {
        throw new ErrorPrograma('sin_bombilla');
      }
    }
  }

  function uno(b) {
    if (!b || b.t === 'REP' || b.t === 'IF') return;
    if (++pasos > 2000) throw new ErrorPrograma('bucle_infinito');
    if (b.t === 'P1') ejecutar(prog.f1);
    else if (b.t === 'P2') ejecutar(prog.f2);
    else actuar(b);
  }

  function ejecutar(lista) {
    for (let i = 0; i < lista.length; i++) {
      const b = lista[i];
      if (b.t === 'REP') {
        const sig = lista[++i];
        for (let k = 0; k < b.n; k++) uno(sig);
      } else if (b.t === 'IF') {
        const sig = lista[++i];
        if (azul()) uno(sig);
      } else {
        uno(b);
      }
    }
  }

  try {
    ejecutar(prog.main);
  } catch (e) {
    if (e instanceof ErrorPrograma) codigo = e.codigo;
    else throw e;
  }

  const ok = !codigo && lit.size === level.l.length;
  return {
    ev,
    ok,
    vacio: ev.length === 0 && !codigo,
    motivo: ok ? null : codigo || 'faltan_bombillas',
    mensaje: ok ? null : MENSAJES[codigo || 'faltan_bombillas'],
  };
}
