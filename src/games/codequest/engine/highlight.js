// Resaltado de sintaxis de Python para el editor. Devuelve HTML (con spans de clase kw, cmd, fn, ...).

const KEYWORDS = new Set([
  'if', 'elif', 'else', 'for', 'while', 'in', 'def', 'return', 'break', 'continue', 'pass', 'and', 'or', 'not',
])
const CONSTANTS = new Set(['True', 'False', 'None'])
const COMMANDS = new Set(['derecha', 'izquierda', 'arriba', 'abajo', 'atacar', 'hay_muro', 'hay_enemigo', 'range'])

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function colorize(code) {
  const defs = new Set()
  const defRe = /\bdef\s+(\w+)/g
  let dm
  while ((dm = defRe.exec(code))) defs.add(dm[1])
  const TOKEN = /(#.*$)|("[^"]*"?|'[^']*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g

  return code
    .split('\n')
    .map((line) => {
      let out = ''
      let prev = ''
      let m
      TOKEN.lastIndex = 0
      while ((m = TOKEN.exec(line))) {
        if (m[1]) out += '<span class="cm">' + escapeHtml(m[1]) + '</span>'
        else if (m[2]) out += '<span class="st">' + escapeHtml(m[2]) + '</span>'
        else if (m[3]) out += '<span class="nu">' + m[3] + '</span>'
        else if (m[4]) {
          const w = m[4]
          const cls = KEYWORDS.has(w)
            ? 'kw'
            : CONSTANTS.has(w)
              ? 'co'
              : COMMANDS.has(w)
                ? 'cmd'
                : prev === 'def' || defs.has(w)
                  ? 'fn'
                  : ''
          out += cls ? '<span class="' + cls + '">' + w + '</span>' : escapeHtml(w)
          prev = w
          continue
        } else out += escapeHtml(m[5])
        if (!(m[5] && /\s/.test(m[5]))) prev = ''
      }
      return out
    })
    .join('\n')
}
