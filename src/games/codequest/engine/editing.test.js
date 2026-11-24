import test from 'node:test'
import assert from 'node:assert/strict'
import { indentSelection, newlineIndent, smartBackspace, suggestions, applySuggestion, wordBefore, userNames, cursorPos } from './editing.js'

test('Tab inserta hasta la siguiente columna múltiplo de 4', () => {
  assert.equal(indentSelection('', 0, 0).value, '    ')
  assert.equal(indentSelection('ab', 2, 2).value, 'ab  ')
})
test('Tab con varias líneas las sangra y Shift+Tab las quita', () => {
  const v = 'a\n\nb'
  const r = indentSelection(v, 0, v.length)
  assert.equal(r.value, '    a\n\n    b')
  const o = indentSelection(r.value, r.selStart, r.selEnd, true)
  assert.equal(o.value, v)
})
test('Shift+Tab en una línea quita hasta 4 espacios', () => {
  assert.equal(indentSelection('      x', 7, 7, true).value, '  x')
  assert.equal(indentSelection('x', 1, 1, true).value, 'x')
})
test('Enter conserva la sangría y suma 4 después de ":"', () => {
  assert.equal(newlineIndent('for i in range(3):', 18, 18).value, 'for i in range(3):\n    ')
  assert.equal(newlineIndent('    derecha()', 13, 13).value, '    derecha()\n    ')
  assert.equal(newlineIndent('if x:  # nota', 13, 13).value, 'if x:  # nota\n    ')
  assert.equal(newlineIndent('# a: b', 6, 6).value, '# a: b\n')
})
test('Backspace en la sangría borra 4 espacios', () => {
  assert.equal(smartBackspace('        x', 8, 8).value, '    x')
  assert.equal(smartBackspace('  x', 2, 2).value, 'x') // 2 espacios -> hasta la columna 0
  assert.equal(smartBackspace('ab', 2, 2), null)
})
test('sugerencias respetan el nivel y completan por prefijo', () => {
  assert.deepEqual(suggestions('de', 0, '').map((x) => x.label), ['derecha'])
  assert.ok(!suggestions('iz', 0, '').length)
  assert.ok(suggestions('iz', 1, '').length)
  assert.ok(suggestions('wh', 11, '').some((x) => x.label === 'while'))
  assert.ok(!suggestions('wh', 3, '').length)
  assert.deepEqual(suggestions('', 5, ''), [])
  assert.ok(suggestions('', 5, '', true).length > 0)
})
test('sugiere variables del estudiante', () => {
  const code = 'pasos = 3\ndef avanzar(n):\n    for k in range(n):\n        derecha()'
  assert.deepEqual(userNames(code).sort(), ['avanzar', 'k', 'n', 'pasos'])
  assert.ok(suggestions('pa', 2, code).some((x) => x.label === 'pasos' && x.kind === 'var'))
})
test('aplicar una sugerencia reemplaza la palabra parcial', () => {
  const v = 'der'
  const s = suggestions('der', 0, v)[0]
  const r = applySuggestion(v, 3, s)
  assert.equal(r.value, 'derecha()')
  assert.equal(r.selStart, 9)
  assert.deepEqual(wordBefore('x = pas', 7), { start: 4, prefix: 'pas' })
})
test('línea y columna del cursor', () => {
  assert.deepEqual(cursorPos('ab\ncd', 4), { line: 2, col: 2 })
  assert.deepEqual(cursorPos('', 0), { line: 1, col: 1 })
})
