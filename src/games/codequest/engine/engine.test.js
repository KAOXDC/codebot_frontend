import test from 'node:test'
import assert from 'node:assert/strict'
import { LEVELS } from './levels.js'
import { REFERENCE } from './reference.js'
import { solveOptimal } from './solver.js'
import { runCode, isSolved } from './simulate.js'
import { medalMask, countLines, BRONZE, SILVER, GOLD } from './medals.js'
import { computePoints } from './scoring.js'
import { translate } from './translate.js'
import { insertCommand } from './commands.js'
import { colorize } from './highlight.js'

const PRE = {
  pasos: 'pasos = 1\n',
  si: 'if True:\n    pass\n',
  sino: 'if False:\n    pass\nelse:\n    pass\n',
  repetir: 'for i in range(1):\n    pass\n',
  mientras: 'while False:\n    pass\n',
  hacer: 'while True:\n    break\n',
  funcion: 'def f():\n    pass\n',
  devolver: 'def g():\n    return 1\n',
}

test('hay 20 niveles', () => assert.equal(LEVELS.length, 20))

for (const lv of LEVELS) {
  test(`nivel ${lv.number}: opt coincide con BFS`, () => {
    assert.equal(solveOptimal(lv).opt, lv.opt)
  })

  test(`nivel ${lv.number}: la solución de referencia gana bronce y plata`, () => {
    const { frames } = runCode(REFERENCE[lv.index], lv)
    assert.ok(isSolved(frames, lv), 'no llega a la meta')
    const mask = medalMask(lv, REFERENCE[lv.index], frames.length)
    assert.ok(mask & BRONZE, 'sin bronce')
    assert.ok(mask & SILVER, `sin plata (${countLines(REFERENCE[lv.index])} líneas > ${lv.lines})`)
    if (lv.max) assert.ok(REFERENCE[lv.index].trim().length <= lv.max, 'excede max caracteres')
  })

  test(`nivel ${lv.number}: el oro es alcanzable con la estructura pedida`, () => {
    const path = solveOptimal(lv).path.map((p) => p + '()\n').join('')
    const code = (lv.need || []).map((k) => PRE[k]).join('') + path
    const { frames } = runCode(code, lv)
    assert.ok(isSolved(frames, lv))
    assert.ok(medalMask(lv, code, frames.length) & GOLD)
  })

  test(`nivel ${lv.number}: sin la estructura pedida no hay medallas`, () => {
    if (!lv.need?.length) return
    const path = solveOptimal(lv).path.map((p) => p + '()\n').join('')
    const { frames } = runCode(path, lv)
    assert.equal(medalMask(lv, path, frames.length), 0)
  })
}

test('puntos', () => {
  assert.equal(computePoints(0, 1), 0)
  assert.equal(computePoints(1, 1), 100)
  assert.equal(computePoints(3, 1), 150)
  assert.equal(computePoints(7, 1), 200)
  assert.equal(computePoints(7, 4), 185)
  assert.equal(computePoints(7, 100), 160)
  assert.equal(computePoints(1, 100), 60)
})

test('ciclo infinito se corta', () => {
  assert.throws(() => runCode('while True:\n    pass\n', LEVELS[0]), /infinito/)
})

test('muchas acciones se cortan', () => {
  assert.throws(() => runCode('for i in range(1000):\n    derecha()\n', LEVELS[0]), /Demasiadas/)
})

test('translate básico', () => {
  const js = translate('for i in range(3):\n    derecha()\nif not hay_muro("derecha") and True:\n    atacar()\nelse:\n    pass\n')
  assert.match(js, /for\(let i=0/)
  assert.match(js, /!\s?hay_muro\("derecha"\) && true/)
  assert.match(js, /else \{/)
  new Function('derecha', 'hay_muro', 'atacar', js)(() => {}, () => false, () => {})
})

test('insertCommand', () => {
  let r = insertCommand('', 0, 0, 'derecha()')
  assert.equal(r.value, 'derecha()')
  r = insertCommand('for i in range(3):\n    ', 23, 23, 'derecha()')
  assert.equal(r.value, 'for i in range(3):\n    derecha()')
  r = insertCommand('derecha()', 9, 9, 'atacar()')
  assert.equal(r.value, 'derecha()\natacar()')
  r = insertCommand('if ', 3, 3, 'not ', true)
  assert.equal(r.value, 'if not ')
})

test('colorize', () => {
  const h = colorize('if x < 3: # hola\n    derecha()')
  assert.match(h, /<span class="kw">if<\/span>/)
  assert.match(h, /&lt;/)
  assert.match(h, /<span class="cmd">derecha<\/span>/)
  assert.match(h, /<span class="cm"># hola<\/span>/)
})
