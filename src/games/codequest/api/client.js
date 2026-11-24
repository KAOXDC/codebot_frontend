// Cliente de la API de CodeQuest (rutas /api/codequest/…). Si el servidor no responde, el juego sigue
// funcionando: las ejecuciones se guardan en una cola en localStorage ('cq_queue') y se reenvían
// cuando haya conexión.
import { API_BASE } from '../../../apiBase.js'

const BASE = API_BASE + '/codequest'
const QUEUE_KEY = 'cq_queue'
const QUEUE_MAX = 500

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}, base = BASE) {
  const res = await fetch(base + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(8000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error || 'Error ' + res.status)
  return data
}

export const registerPlayer = ({ username, heroId }) =>
  request('/players', { method: 'POST', body: JSON.stringify({ username, heroId }) })

export const getProgress = (playerId) => request('/players/' + playerId + '/progress')

export const postAttempt = (payload) => request('/attempts', { method: 'POST', body: JSON.stringify(payload) })

// /api/health es común a toda la plataforma
export const checkHealth = () => request('/health', {}, API_BASE)

/* ---- cola sin conexión ---- */
function loadQueue() {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    return Array.isArray(q) ? q : []
  } catch {
    return []
  }
}
function saveQueue(q) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-QUEUE_MAX)))
  } catch {
    /* sin almacenamiento */
  }
}

export const pendingCount = () => loadQueue().length

let flushing = false

// Envía la cola en orden. Si el jugador aún no existe en el servidor (se registró sin conexión), lo registra primero.
// onSession(nuevaSesion) se llama cuando se obtiene un id del servidor.
export async function flushQueue(session, onSession) {
  if (flushing || !session) return
  flushing = true
  try {
    let s = session
    let q = loadQueue()
    while (q.length) {
      if (!s.id) {
        const r = await registerPlayer(s)
        s = { ...s, id: r.id }
        onSession?.(s)
      }
      try {
        await postAttempt({ ...q[0], playerId: s.id })
      } catch (e) {
        if (e instanceof ApiError && e.status === 400) {
          // dato inválido: se descarta para no bloquear la cola
        } else if (e instanceof ApiError && e.status === 404) {
          s = { ...s, id: null } // el servidor no conoce al jugador: se vuelve a registrar
          continue
        } else throw e
      }
      q = q.slice(1)
      saveQueue(q)
    }
  } catch {
    /* sin conexión: queda en cola */
  } finally {
    flushing = false
  }
}

export async function submitAttempt(session, payload, onSession) {
  saveQueue([...loadQueue(), payload])
  await flushQueue(session, onSession)
}
