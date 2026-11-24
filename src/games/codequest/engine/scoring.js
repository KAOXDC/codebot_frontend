// Puntos por ejecución.
//  - Sin medalla (no llegó a la meta o no usó la estructura pedida): 0
//  - Llegar a la meta usando la estructura: 100
//  - Plata: +50   Oro: +50
//  - Descuento de 5 puntos por cada ejecución anterior en esa apertura del nivel (máx. 40),
//    con un mínimo de 10 puntos si ganó alguna medalla.
// IMPORTANTE: backend/src/scoring.js es una copia de este archivo. Si cambias uno, cambia el otro.

export const POINTS = {
  goal: 100,
  silver: 50,
  gold: 50,
  penaltyPerAttempt: 5,
  maxPenalty: 40,
  minimum: 10,
}

export function computePoints(mask, attemptNumber = 1) {
  if (!(mask & 1)) return 0
  const base = POINTS.goal + (mask & 2 ? POINTS.silver : 0) + (mask & 4 ? POINTS.gold : 0)
  const failed = Math.max(0, Math.floor(attemptNumber) - 1)
  const penalty = Math.min(POINTS.maxPenalty, failed * POINTS.penaltyPerAttempt)
  return Math.max(POINTS.minimum, base - penalty)
}
