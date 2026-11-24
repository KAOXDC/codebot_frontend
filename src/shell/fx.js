import confetti from 'canvas-confetti'

const reducido = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const COLORES = ['#06b6d4', '#7c3aed', '#f97316', '#facc15', '#22c55e']

// Confeti desde los dos lados (celebración al terminar un nivel o el juego)
export function celebrar(intensidad = 1) {
  if (reducido()) return
  const base = { colors: COLORES, zIndex: 100, disableForReducedMotion: true }
  confetti({ ...base, particleCount: Math.round(60 * intensidad), spread: 70, origin: { x: 0.2, y: 0.7 }, angle: 60 })
  confetti({ ...base, particleCount: Math.round(60 * intensidad), spread: 70, origin: { x: 0.8, y: 0.7 }, angle: 120 })
}

// Lluvia larga para el final del juego
export function lluviaFinal() {
  if (reducido()) return
  const fin = Date.now() + 1800
  const tick = () => {
    confetti({ particleCount: 4, spread: 80, startVelocity: 35, origin: { x: Math.random(), y: -0.05 }, colors: COLORES, zIndex: 100, gravity: 0.9 })
    if (Date.now() < fin) requestAnimationFrame(tick)
  }
  tick()
}
