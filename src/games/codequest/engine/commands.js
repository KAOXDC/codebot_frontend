// Barra de comandos: cada botón escribe código en el editor.
// Cada comando: { label, text, inline, from } donde `from` es el nivel (0 = nivel 1) desde el que aparece.

const c = (label, text, from, inline = false) => ({ label, text, inline, from })

export const COMMAND_GROUPS = [
  { name: 'Movimiento', color: '#60a5fa', commands: [c('derecha()', 'derecha()', 0), c('izquierda()', 'izquierda()', 1), c('arriba()', 'arriba()', 1), c('abajo()', 'abajo()', 1)] },
  { name: 'Acción', color: '#f87171', commands: [c('atacar()', 'atacar()', 4)] },
  { name: 'Sensores', color: '#22d3ee', commands: [c('hay_muro', 'hay_muro("derecha")', 4, true), c('hay_enemigo', 'hay_enemigo("derecha")', 4, true)] },
  { name: 'Variables', color: '#4ade80', commands: [c('pasos = 3', 'pasos = 3', 2), c('pasos = pasos + 1', 'pasos = pasos + 1', 2)] },
  { name: 'Condicionales', color: '#ffd166', commands: [
    c('if', 'if hay_enemigo("derecha"):\n    ', 4),
    c('elif', 'elif hay_muro("derecha"):\n    ', 6),
    c('else', 'else:\n    ', 5),
    c('and', ' and ', 7, true),
    c('or', ' or ', 7, true),
    c('not', 'not ', 7, true),
  ] },
  { name: 'Ciclos', color: '#c084fc', commands: [
    c('for … in range', 'for i in range(3):\n    ', 2),
    c('while', 'while not hay_muro("derecha"):\n    ', 11),
    c('while True + break', 'while True:\n    atacar()\n    if not hay_enemigo("derecha"):\n        break', 13),
  ] },
  { name: 'Funciones', color: '#fb923c', commands: [
    c('def', 'def nombre():\n    ', 14),
    c('def con parámetro', 'def avanzar(n):\n    for i in range(n):\n        derecha()', 15),
    c('return', 'return n * 2', 16),
  ] },
]

// Grupos y comandos disponibles en el nivel `levelIndex` (0-based)
export function commandsFor(levelIndex) {
  return COMMAND_GROUPS.map((g) => ({ ...g, commands: g.commands.filter((cmd) => cmd.from <= levelIndex) })).filter(
    (g) => g.commands.length,
  )
}

// Inserta `text` en `value` en la posición del cursor (selStart..selEnd) respetando la sangría.
// Devuelve { value, cursor } con el nuevo texto y la nueva posición del cursor.
export function insertCommand(value, selStart, selEnd, text, inline = false) {
  if (inline) {
    return { value: value.slice(0, selStart) + text + value.slice(selEnd), cursor: selStart + text.length }
  }
  const lineStart = value.lastIndexOf('\n', selStart - 1) + 1
  let lineEnd = value.indexOf('\n', selStart)
  if (lineEnd < 0) lineEnd = value.length
  const line = value.slice(lineStart, lineEnd)
  const before = value.slice(lineStart, selStart)

  if (line.trim() === '') {
    // Línea vacía: se escribe ahí, con la sangría que corresponde
    let indent = before
    if (!before && lineStart > 0) {
      const prev = value.slice(value.lastIndexOf('\n', lineStart - 2) + 1, lineStart - 1)
      indent = prev.match(/^ */)[0] + (prev.trim().endsWith(':') ? '    ' : '')
    }
    const ins = indent + text.split('\n').join('\n' + indent)
    return { value: value.slice(0, lineStart) + ins + value.slice(lineEnd), cursor: lineStart + ins.length }
  }
  // Línea con código: se escribe en una línea nueva debajo
  const indent = line.match(/^ */)[0] + (line.trim().endsWith(':') ? '    ' : '')
  const ins = '\n' + indent + text.split('\n').join('\n' + indent)
  return { value: value.slice(0, lineEnd) + ins + value.slice(lineEnd), cursor: lineEnd + ins.length }
}
