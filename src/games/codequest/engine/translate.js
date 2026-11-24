// Traductor de un subconjunto de Python a JavaScript.
// Soporta: for ... in range(), while, if / elif / else, def, return, break, continue, pass,
// asignaciones (=, +=, -=, *=), and / or / not, True / False y comentarios con #.
// Con guard=true inserta un contador que corta los ciclos infinitos.

export function translate(src, guard = false) {
  const out = []
  const stack = [0]
  let loops = 0
  const ex = (s) =>
    s
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!')
  const G = guard ? 'if(++__g>3000)throw new Error("Ciclo infinito: tu código nunca termina");' : ''

  for (const raw of src.split('\n')) {
    const t = raw.replace(/#.*$/, '').replace(/\s+$/, '')
    if (!t.trim()) continue
    const indent = t.match(/^ */)[0].length
    const s = t.trim()
    let closed = 0
    let pre = ''
    let m
    while (indent < stack[stack.length - 1]) {
      stack.pop()
      closed++
    }
    if (indent > stack[stack.length - 1]) stack.push(indent)
    if (/^(else|elif)\b/.test(s) && closed > 0) {
      closed--
      pre = '} '
    }
    if (closed > 0) out.push('}'.repeat(closed))

    if ((m = s.match(/^for\s+(\w+)\s+in\s+range\((.+)\)\s*:$/))) {
      const p = m[2].split(',')
      const lo = p.length > 1 ? ex(p[0]) : '0'
      const hi = ex(p.length > 1 ? p.slice(1).join(',') : p[0])
      const n = '__n' + loops++
      out.push(pre + 'for(let ' + m[1] + '=' + lo + ',' + n + '=(' + hi + ');' + m[1] + '<' + n + ';' + m[1] + '++){' + G)
    } else if ((m = s.match(/^while\s+(.+):$/))) out.push(pre + 'while(' + ex(m[1]) + '){' + G)
    else if ((m = s.match(/^if\s+(.+):$/))) out.push(pre + 'if(' + ex(m[1]) + '){')
    else if ((m = s.match(/^elif\s+(.+):$/))) out.push(pre + 'else if(' + ex(m[1]) + '){')
    else if (/^else\s*:$/.test(s)) out.push(pre + 'else {')
    else if ((m = s.match(/^def\s+(\w+)\((.*)\)\s*:$/))) out.push('function ' + m[1] + '(' + m[2] + '){')
    else if ((m = s.match(/^return\b\s*(.*)$/))) out.push('return ' + ex(m[1]) + ';')
    else if (s === 'break' || s === 'continue') out.push(s + ';')
    else if (s === 'pass') out.push(';')
    else if ((m = s.match(/^(\w+)\s*([+\-*])=\s*(.+)$/))) out.push(m[1] + m[2] + '=' + ex(m[3]) + ';')
    else if ((m = s.match(/^(\w+)\s*=(?!=)\s*(.+)$/))) out.push('var ' + m[1] + '=' + ex(m[2]) + ';')
    else out.push(ex(s) + ';')
  }
  out.push('}'.repeat(stack.length - 1))
  return out.join('\n')
}

// Versión para mostrar al estudiante ("Ver en JavaScript")
export function toJavaScriptView(src) {
  try {
    return translate(src)
  } catch (e) {
    return '// No se pudo traducir: ' + e.message
  }
}
