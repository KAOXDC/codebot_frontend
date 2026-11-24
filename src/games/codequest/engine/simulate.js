// Simulación del héroe: ejecuta el código del estudiante y devuelve la lista de "frames"
// (una acción del héroe = un frame). No depende de React ni del DOM.
import { translate } from './translate.js'

export const MAX_FRAMES = 600

const DIRECTIONS = {
  derecha: [1, 0],
  izquierda: [-1, 0],
  arriba: [0, -1],
  abajo: [0, 1],
}

export function initState(level) {
  const s = {
    w: level.map[0].length,
    h: level.map.length,
    walls: new Set(),
    gems: new Set(),
    enemies: new Set(),
    x: 0,
    y: 0,
    face: 0,
  }
  level.map.forEach((row, y) =>
    [...row].forEach((c, x) => {
      const k = x + ',' + y
      if (c === '#') s.walls.add(k)
      else if (c === 'G') s.gems.add(k)
      else if (c === 'E') s.enemies.add(k)
      else if (c === 'H') {
        s.x = x
        s.y = y
      }
    }),
  )
  return s
}

// Devuelve { frames, state }. Cada frame: { x, y, face, gems, enemies, event, hits? }
// event: 'step' | 'bump' | 'gem' | 'attack' | 'miss'
export function runCode(code, level) {
  const s = initState(level)
  const frames = []
  const push = (event) => {
    if (frames.length >= MAX_FRAMES) throw new Error('Demasiadas acciones: ¿hay un ciclo infinito?')
    frames.push({ x: s.x, y: s.y, face: s.face, gems: new Set(s.gems), enemies: new Set(s.enemies), event })
  }
  const blocked = (nx, ny) => {
    const k = nx + ',' + ny
    return s.walls.has(k) || s.enemies.has(k) || nx < 0 || ny < 0 || nx >= s.w || ny >= s.h
  }
  const api = {}
  Object.keys(DIRECTIONS).forEach((name) => {
    api[name] = () => {
      const nx = s.x + DIRECTIONS[name][0]
      const ny = s.y + DIRECTIONS[name][1]
      if (name === 'izquierda') s.face = 1
      else if (name === 'derecha') s.face = 0
      if (blocked(nx, ny)) {
        push('bump')
        return
      }
      s.x = nx
      s.y = ny
      const k = nx + ',' + ny
      let event = 'step'
      if (s.gems.has(k)) {
        s.gems.delete(k)
        event = 'gem'
      }
      push(event)
    }
  })
  api.atacar = () => {
    const hits = []
    Object.values(DIRECTIONS).forEach((d) => {
      const k = s.x + d[0] + ',' + (s.y + d[1])
      if (s.enemies.has(k)) {
        s.enemies.delete(k)
        hits.push({ x: s.x + d[0], y: s.y + d[1], dx: d[0], dy: d[1] })
      }
    })
    push(hits.length ? 'attack' : 'miss')
    frames[frames.length - 1].hits = hits
  }
  api.hay_muro = (d) => {
    const v = DIRECTIONS[d]
    return v ? s.walls.has(s.x + v[0] + ',' + (s.y + v[1])) : false
  }
  api.hay_enemigo = (d) => {
    const v = DIRECTIONS[d]
    return v ? s.enemies.has(s.x + v[0] + ',' + (s.y + v[1])) : false
  }

  const js = translate(code, true)
  const names = Object.keys(api)
  // Nota de seguridad: el código se ejecuta en el navegador del propio estudiante.
  // No ejecutes este módulo con código de terceros en un servidor sin un sandbox.
  new Function(...names, 'return (function(){let __g=0;' + js + '\n})()')(...names.map((n) => api[n]))
  return { frames, state: s }
}

export function isSolved(frames, level) {
  const last = frames[frames.length - 1]
  if (last) return last.gems.size === 0 && last.enemies.size === 0
  const s = initState(level)
  return s.gems.size === 0 && s.enemies.size === 0
}

// Convierte una excepción de runCode() en un mensaje claro para el estudiante
export function friendlyError(e) {
  if (e instanceof SyntaxError)
    return 'hay un error de sintaxis. Revisa los dos puntos (:), los paréntesis, las comillas y la sangría.'
  if (e instanceof ReferenceError) {
    const q = /(\w+) is not defined/.exec(e.message)
    if (q) return 'no conozco "' + q[1] + '". Revisa cómo escribiste el comando o la variable.'
  }
  return e.message
}
