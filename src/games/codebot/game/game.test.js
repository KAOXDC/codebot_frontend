import test from 'node:test'
import assert from 'node:assert/strict'
import { LEVELS } from './levels.js'
import { simular } from './interpreter.js'
import { puntuarNivel, contarBloques } from './scoring.js'

test('hay 12 niveles con 4 temáticas de 3 niveles', () => {
  assert.equal(LEVELS.length, 12)
  const por = {}
  for (const l of LEVELS) por[l.tematica] = (por[l.tematica] || 0) + 1
  assert.equal(Object.keys(por).length, 4)
  assert.ok(Object.values(por).every((n) => n === 3))
})

test('programa vacío no resuelve ningún nivel', () => {
  for (const l of LEVELS) {
    const r = simular(l, { main: [], f1: [], f2: [] })
    assert.ok(Array.isArray(r.ev), `nivel ${l.n}`)
    assert.notEqual(r.ok, true, `nivel ${l.n} no debe resolverse vacío`)
  }
})

test('puntaje máximo 200 y mínimo 100', () => {
  const l = LEVELS[0]
  assert.equal(puntuarNivel(l, 0, 1, 1).total, 200)
  assert.equal(puntuarNivel(l, 99999, 99, 99).total, 100)
  assert.equal(puntuarNivel(l, 0, 1, 1).estrellas, 3)
  assert.equal(contarBloques({ main: [1, 2], f1: [3], f2: [] }), 3)
})

test('encender dos veces la misma bombilla la apaga', async () => {
  const { simular } = await import('./interpreter.js');
  const nivel = LEVELS[0]; // una bombilla al final de la fila
  const avanzar = Array.from({ length: 3 }, () => ({ t: 'F', n: 2 }));
  const una = simular(nivel, { main: [...avanzar, { t: 'B', n: 2 }], f1: [], f2: [] });
  assert.equal(una.ok, true);
  const dos = simular(nivel, { main: [...avanzar, { t: 'B', n: 2 }, { t: 'B', n: 2 }], f1: [], f2: [] });
  assert.equal(dos.ok, false);
  assert.equal(dos.motivo, 'faltan_bombillas');
  assert.equal(dos.ev.at(-1).off, true);
  assert.deepEqual(dos.ev.at(-1).lit, []);
  const tres = simular(nivel, { main: [...avanzar, { t: 'B', n: 2 }, { t: 'B', n: 2 }, { t: 'B', n: 2 }], f1: [], f2: [] });
  assert.equal(tres.ok, true);
});
