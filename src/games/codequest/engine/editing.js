// Lógica pura del editor (sin DOM): sangría, autocompletar y posición del cursor. Así se puede probar con node --test.
export const INDENT = '    '

const lineStartOf = (v, i) => v.lastIndexOf('\n', i - 1) + 1
const lineEndOf = (v, i) => {
  const e = v.indexOf('\n', i)
  return e === -1 ? v.length : e
}

// Línea y columna (desde 1) del cursor
export function cursorPos(value, i) {
  const before = value.slice(0, i)
  const line = before.split('\n').length
  return { line, col: i - lineStart(before) + 1 }
}
const lineStart = (s) => s.lastIndexOf('\n') + 1

// Tab / Shift+Tab. Sin selección multilínea: inserta o quita 4 espacios. Con varias líneas, las sangra todas.
export function indentSelection(value, s, e, outdent = false) {
  const multi = value.slice(s, e).includes('\n')
  if (!outdent && !multi) {
    const col = s - lineStartOf(value, s)
    const n = INDENT.length - (col % INDENT.length) // se alinea a la siguiente columna múltiplo de 4
    const ins = ' '.repeat(n)
    return { value: value.slice(0, s) + ins + value.slice(e), selStart: s + n, selEnd: s + n }
  }
  const a = lineStartOf(value, s)
  const b = lineEndOf(value, e > s && value[e - 1] === '\n' ? e - 1 : e)
  const lines = value.slice(a, b).split('\n')
  let first = 0
  let total = 0
  const out = lines.map((ln, i) => {
    let d
    if (outdent) {
      const m = ln.match(/^ {1,4}/)
      d = m ? -m[0].length : 0
      ln = ln.slice(m ? m[0].length : 0)
    } else {
      d = ln.trim() ? INDENT.length : 0
      if (d) ln = INDENT + ln
    }
    if (i === 0) first = d
    total += d
    return ln
  })
  const nv = value.slice(0, a) + out.join('\n') + value.slice(b)
  if (s === e) {
    const c = Math.max(a, s + first)
    return { value: nv, selStart: c, selEnd: c }
  }
  return { value: nv, selStart: Math.max(a, s + first), selEnd: Math.max(a, e + total) }
}

// Enter: conserva la sangría de la línea y añade 4 espacios si la línea termina en ":"
export function newlineIndent(value, s, e) {
  const upto = value.slice(lineStartOf(value, s), s)
  const base = upto.match(/^ */)[0]
  const code = upto.replace(/#.*$/, '').trimEnd() // el ":" cuenta aunque haya un comentario después
  const extra = code.endsWith(':') ? INDENT : ''
  const ins = '\n' + base + extra
  return { value: value.slice(0, s) + ins + value.slice(e), selStart: s + ins.length, selEnd: s + ins.length }
}

// Backspace dentro de la sangría borra 4 espacios de una vez (como en un editor de código)
export function smartBackspace(value, s, e) {
  if (s !== e || s === 0) return null
  const ls = lineStartOf(value, s)
  const before = value.slice(ls, s)
  if (!before || /[^ ]/.test(before)) return null
  const n = before.length % INDENT.length || INDENT.length
  return { value: value.slice(0, s - n) + value.slice(s), selStart: s - n, selEnd: s - n }
}

// ---- Autocompletar ----
const KEYWORDS = [
  { w: 'for', ins: 'for i in range(3):', from: 2, d: 'ciclo' },
  { w: 'range', ins: 'range(', from: 2, d: 'rango' },
  { w: 'in', ins: 'in ', from: 2, d: 'palabra de Python' },
  { w: 'if', ins: 'if ', from: 4, d: 'condicional' },
  { w: 'else', ins: 'else:', from: 5, d: 'condicional' },
  { w: 'elif', ins: 'elif ', from: 6, d: 'condicional' },
  { w: 'and', ins: 'and ', from: 7, d: 'lógico' },
  { w: 'or', ins: 'or ', from: 7, d: 'lógico' },
  { w: 'not', ins: 'not ', from: 7, d: 'lógico' },
  { w: 'while', ins: 'while ', from: 11, d: 'ciclo' },
  { w: 'break', ins: 'break', from: 13, d: 'salir del ciclo' },
  { w: 'def', ins: 'def nombre():', from: 14, d: 'función' },
  { w: 'return', ins: 'return ', from: 16, d: 'devuelve un valor' },
  { w: 'True', ins: 'True', from: 11, d: 'verdadero' },
  { w: 'False', ins: 'False', from: 11, d: 'falso' },
]
const GAME = [
  { w: 'derecha', ins: 'derecha()', from: 0, d: 'mover' },
  { w: 'izquierda', ins: 'izquierda()', from: 1, d: 'mover' },
  { w: 'arriba', ins: 'arriba()', from: 1, d: 'mover' },
  { w: 'abajo', ins: 'abajo()', from: 1, d: 'mover' },
  { w: 'atacar', ins: 'atacar()', from: 4, d: 'acción' },
  { w: 'hay_muro', ins: 'hay_muro("derecha")', from: 4, d: 'sensor' },
  { w: 'hay_enemigo', ins: 'hay_enemigo("derecha")', from: 4, d: 'sensor' },
]

// Variables, funciones y parámetros que el estudiante ya escribió
export function userNames(code) {
  const names = new Set()
  const src = code.replace(/#.*$/gm, '')
  for (const m of src.matchAll(/^\s*([A-Za-z_]\w*)\s*(?:[-+*]?=)(?!=)/gm)) names.add(m[1])
  for (const m of src.matchAll(/\bdef\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/g)) {
    names.add(m[1])
    m[2].split(',').map((x) => x.trim()).filter(Boolean).forEach((x) => names.add(x))
  }
  for (const m of src.matchAll(/\bfor\s+([A-Za-z_]\w*)\s+in\b/g)) names.add(m[1])
  return [...names]
}

// Palabra que se está escribiendo justo antes del cursor
export function wordBefore(value, i) {
  const m = value.slice(0, i).match(/[A-Za-z_][A-Za-z_0-9]*$/)
  return m ? { start: i - m[0].length, prefix: m[0] } : { start: i, prefix: '' }
}

// Sugerencias para `prefix`. Solo aparecen los comandos y palabras que el nivel ya desbloqueó.
export function suggestions(prefix, levelIndex, code, force = false) {
  if (!prefix && !force) return []
  const p = prefix.toLowerCase()
  const seen = new Set()
  const out = []
  const add = (label, ins, kind, d) => {
    if (seen.has(label)) return
    seen.add(label)
    out.push({ label, ins, kind, d })
  }
  GAME.filter((x) => x.from <= levelIndex).forEach((x) => add(x.w, x.ins, 'cmd', x.d))
  KEYWORDS.filter((x) => x.from <= levelIndex).forEach((x) => add(x.w, x.ins, 'kw', x.d))
  userNames(code).forEach((n) => add(n, n, 'var', 'tu variable'))
  return out
    .filter((x) => x.label.toLowerCase().startsWith(p) && !(x.label === prefix && x.ins === x.label))
    .sort((a, b) => (a.kind === 'var') - (b.kind === 'var') || a.label.length - b.label.length)
    .slice(0, 6)
}

// Aplica una sugerencia reemplazando la palabra parcial
export function applySuggestion(value, cursor, sug) {
  const { start } = wordBefore(value, cursor)
  const c = start + sug.ins.length
  return { value: value.slice(0, start) + sug.ins + value.slice(cursor), selStart: c, selEnd: c }
}
