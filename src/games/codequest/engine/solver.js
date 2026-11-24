// Solución óptima de un nivel por búsqueda en anchura (BFS).
// Se usa para calcular el mínimo de pasos del héroe (`opt`, medalla de oro) y para probar los niveles.
// Estado = posición + gemas pendientes + enemigos vivos. Una acción (mover o atacar) cuenta un paso.

const MOVES = [
  ['derecha', 1, 0],
  ['izquierda', -1, 0],
  ['arriba', 0, -1],
  ['abajo', 0, 1],
]

export function solveOptimal(level) {
  const map = level.map
  const H = map.length
  const W = map[0].length
  const gems = []
  const enemies = []
  let sx = 0
  let sy = 0
  map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === 'G') gems.push([x, y])
      else if (ch === 'E') enemies.push([x, y])
      else if (ch === 'H') {
        sx = x
        sy = y
      }
    }),
  )
  const wall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || map[y][x] === '#'
  const gemAt = (x, y) => gems.findIndex((g) => g[0] === x && g[1] === y)
  const enemyAt = (x, y) => enemies.findIndex((g) => g[0] === x && g[1] === y)
  const key = (x, y, g, e) => x + ',' + y + ',' + g + ',' + e

  const g0 = (1 << gems.length) - 1
  const e0 = (1 << enemies.length) - 1
  let queue = [[sx, sy, g0, e0, []]]
  const seen = new Set([key(sx, sy, g0, e0)])

  for (let depth = 0; queue.length; depth++) {
    const next = []
    for (const [x, y, g, e, path] of queue) {
      if (g === 0 && e === 0) return { opt: depth, path }
      for (const [name, dx, dy] of MOVES) {
        const nx = x + dx
        const ny = y + dy
        if (wall(nx, ny)) continue
        const k = enemyAt(nx, ny)
        if (k >= 0 && (e >> k) & 1) continue
        let ng = g
        const gk = gemAt(nx, ny)
        if (gk >= 0) ng &= ~(1 << gk)
        const kk = key(nx, ny, ng, e)
        if (!seen.has(kk)) {
          seen.add(kk)
          next.push([nx, ny, ng, e, [...path, name]])
        }
      }
      let ne = e
      for (const [, dx, dy] of MOVES) {
        const k = enemyAt(x + dx, y + dy)
        if (k >= 0 && (ne >> k) & 1) ne &= ~(1 << k)
      }
      if (ne !== e) {
        const kk = key(x, y, g, ne)
        if (!seen.has(kk)) {
          seen.add(kk)
          next.push([x, y, g, ne, [...path, 'atacar']])
        }
      }
    }
    queue = next
  }
  return null
}
