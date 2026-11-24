import { useCallback, useEffect, useState } from 'react'
import { medalCount } from '../engine/medals.js'

// Progreso del jugador en este dispositivo: { [índice de nivel 0-based]: { m: máscara de medallas, p: mejores puntos } }
// Se guarda por nombre de usuario y se mezcla con el del servidor cuando hay conexión.

const keyFor = (username) => 'cq_progress:' + (username || '').toLowerCase()

function load(username) {
  if (!username) return {}
  try {
    return JSON.parse(localStorage.getItem(keyFor(username)) || '{}') || {}
  } catch {
    return {}
  }
}

function save(username, data) {
  try {
    localStorage.setItem(keyFor(username), JSON.stringify(data))
  } catch {
    /* sin almacenamiento */
  }
}

export function useProgress(username) {
  const [progress, setProgress] = useState(() => load(username))
  const [allOpen, setAllOpen] = useState(() => {
    try {
      return localStorage.getItem('cq_all') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => setProgress(load(username)), [username])

  const update = useCallback(
    (fn) =>
      setProgress((prev) => {
        const next = fn(prev)
        save(username, next)
        return next
      }),
    [username],
  )

  const record = useCallback(
    (levelIndex, mask, points) =>
      update((p) => {
        const cur = p[levelIndex] || { m: 0, p: 0 }
        return { ...p, [levelIndex]: { m: cur.m | mask, p: Math.max(cur.p, points) } }
      }),
    [update],
  )

  // levels: [{ level (1-based), medals, bestPoints }] que devuelve GET /players/:id/progress
  const mergeServer = useCallback(
    (levels) =>
      update((p) => {
        const next = { ...p }
        for (const l of levels || []) {
          const i = l.level - 1
          const cur = next[i] || { m: 0, p: 0 }
          if (l.medals || l.completed) next[i] = { m: cur.m | (l.medals || 0), p: Math.max(cur.p, l.bestPoints || 0) }
        }
        return next
      }),
    [update],
  )

  const toggleAllOpen = useCallback(() => {
    setAllOpen((v) => {
      try {
        localStorage.setItem('cq_all', v ? '0' : '1')
      } catch {
        /* sin almacenamiento */
      }
      return !v
    })
  }, [])

  const medalsOf = (i) => progress[i]?.m || 0
  const isDone = (i) => medalsOf(i) > 0
  const totalMedals = Object.values(progress).reduce((a, v) => a + medalCount(v.m), 0)
  const totalPoints = Object.values(progress).reduce((a, v) => a + (v.p || 0), 0)
  // un nivel está abierto si es el primero, si se completó el anterior o si ya se completó él mismo
  const isUnlocked = (i) => allOpen || i === 0 || isDone(i - 1) || isDone(i)

  return { record, mergeServer, allOpen, toggleAllOpen, medalsOf, isDone, isUnlocked, totalMedals, totalPoints }
}
