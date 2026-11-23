export const TEMATICAS = [
  { nombre: 'Secuencias', ayuda: 'Las instrucciones se ejecutan en orden, una tras otra.' },
  { nombre: 'Funciones', ayuda: 'Agrupa instrucciones en F1/F2 y reutilízalas con un solo bloque.' },
  { nombre: 'Bucles', ayuda: '🔁 repite el bloque siguiente N veces (toca el bloque para cambiar N).' },
  { nombre: 'Condicionales', ayuda: '🔷 ejecuta el bloque siguiente solo si estás sobre una casilla azul.' },
];

export const BLOQUES = {
  F: { icono: '⬆️', nombre: 'Avanzar', color: '#6366f1' },
  L: { icono: '↶', nombre: 'Izquierda', color: '#0ea5e9' },
  R: { icono: '↷', nombre: 'Derecha', color: '#0ea5e9' },
  J: { icono: '⤴️', nombre: 'Saltar', color: '#8b5cf6' },
  B: { icono: '💡', nombre: 'Encender', color: '#f59e0b' },
  P1: { icono: 'F1', nombre: 'Función 1', color: '#10b981' },
  P2: { icono: 'F2', nombre: 'Función 2', color: '#14b8a6' },
  REP: { icono: '🔁', nombre: 'Repetir', color: '#f43f5e' },
  IF: { icono: '🔷', nombre: 'Si azul', color: '#3b82f6' },
};

const RING3 = ['000', '0.0', '000'];
const LINE7 = ['0000000'];

// t: temática (0-3) · g: mapa (dígito = altura, '.' = vacío) · s: [x, y, dirección 0↑ 1→ 2↓ 3←]
// l: bombillas · blue: casillas azules · m/f1/f2: máximo de bloques por fila
// a: bloques permitidos · par: bloques ideales (para el puntaje) · tp: segundos de referencia
const RAW = [
  { t: 0, n: 'Primeros pasos', g: ['0000'], s: [0, 0, 1], l: [[3, 0]], m: 6, a: ['F', 'L', 'R', 'B'], par: 4, tp: 40 },
  { t: 0, n: 'Una esquina', g: ['000', '..0', '..0'], s: [0, 0, 1], l: [[2, 2]], m: 8, a: ['F', 'L', 'R', 'B'], par: 6, tp: 60 },
  { t: 0, n: 'Escaleras', g: ['00122'], s: [0, 0, 1], l: [[4, 0]], m: 8, a: ['F', 'L', 'R', 'J', 'B'], par: 6, tp: 70 },
  { t: 1, n: 'Tres bombillas', g: LINE7, s: [0, 0, 1], l: [[2, 0], [4, 0], [6, 0]], m: 4, f1: 3, a: ['F', 'R', 'B', 'P1'], par: 6, tp: 90 },
  { t: 1, n: 'El cuadrado', g: RING3, s: [0, 0, 1], l: [[2, 0], [2, 2], [0, 2]], m: 4, f1: 4, a: ['F', 'R', 'B', 'P1'], par: 6, tp: 100 },
  { t: 1, n: 'La serpiente', g: ['00000', '....0', '00000'], s: [0, 0, 1], l: [[4, 0], [0, 2]], m: 10, f1: 2, f2: 3, a: ['F', 'L', 'R', 'B', 'P1', 'P2'], par: 10, tp: 120 },
  { t: 2, n: 'Repite el paso', g: ['000000'], s: [0, 0, 1], l: [[5, 0]], m: 3, a: ['F', 'R', 'B', 'REP'], par: 3, tp: 60 },
  { t: 2, n: 'Vuelta completa', g: RING3, s: [0, 0, 1], l: [[2, 0], [2, 2], [0, 2], [0, 0]], m: 5, f1: 4, a: ['F', 'R', 'B', 'REP', 'P1'], par: 6, tp: 110 },
  { t: 2, n: 'Función repetida', g: LINE7, s: [0, 0, 1], l: [[2, 0], [4, 0], [6, 0]], m: 2, f1: 3, a: ['F', 'R', 'B', 'REP', 'P1'], par: 5, tp: 110 },
  { t: 3, n: 'Solo las azules', g: ['00000'], s: [0, 0, 1], l: [[1, 0], [2, 0], [4, 0]], blue: [[1, 0], [2, 0], [4, 0]], m: 6, f1: 3, a: ['F', 'B', 'IF', 'P1'], par: 7, tp: 120 },
  { t: 3, n: 'Camino irregular', g: LINE7, s: [0, 0, 1], l: [[2, 0], [3, 0], [5, 0]], blue: [[2, 0], [3, 0], [5, 0]], m: 3, f1: 3, a: ['F', 'B', 'IF', 'P1', 'REP'], par: 6, tp: 130 },
  { t: 3, n: 'El gran circuito', g: ['0000', '0..0', '0..0', '0000'], s: [0, 0, 1], l: [[3, 0], [3, 3], [0, 3], [0, 0]], blue: [[3, 0], [3, 3], [0, 3], [0, 0]], m: 3, f1: 5, a: ['F', 'R', 'B', 'IF', 'REP', 'P1'], par: 8, tp: 160 },
];

export const LEVELS = RAW.map((lv) => ({
  ...lv,
  blue: lv.blue || [],
  tematica: TEMATICAS[lv.t].nombre,
}));
