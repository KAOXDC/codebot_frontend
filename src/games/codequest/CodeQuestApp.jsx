import { useCallback, useEffect, useState } from 'react'
import GameShell from '../../shell/GameShell.jsx'
import css from './styles.css?inline'
import { LEVELS } from './engine/levels.js'
import { initAudio, isMuted, setMuted, sfx, startMusic, stopMusic } from './audio/audio.js'
import { flushQueue, getProgress, submitAttempt } from './api/client.js'
import { useProgress } from './hooks/useProgress.js'
import RegisterScreen from './components/RegisterScreen.jsx'
import MapScreen from './components/MapScreen.jsx'
import PlayScreen from './components/PlayScreen.jsx'

const SESSION_KEY = 'cq_user'

function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!s || !s.username) return null
    // Versiones anteriores guardaban un correo o teléfono: ya no se usa ni se conserva
    const { contact, ...resto } = s // eslint-disable-line no-unused-vars
    return resto
  } catch {
    return null
  }
}

function persistSession(s) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  } catch {
    /* sin almacenamiento */
  }
}

export default function CodeQuestApp() {
  const [session, setSessionState] = useState(loadSession)
  const [screen, setScreen] = useState(() => (loadSession() ? 'map' : 'register'))
  const [levelIndex, setLevelIndex] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  const progress = useProgress(session?.username)
  const { mergeServer, record } = progress

  // Al volver al menú se apaga la música de este juego
  useEffect(() => () => stopMusic(), [])

  const setSession = useCallback((s) => {
    setSessionState(s)
    persistSession(s)
  }, [])

  // Al entrar (o cuando el jugador obtiene id): reenvía lo pendiente y trae el progreso del servidor
  useEffect(() => {
    if (!session) return undefined
    let cancelled = false
    ;(async () => {
      await flushQueue(session, setSession)
      if (session.id && !cancelled) {
        try {
          const r = await getProgress(session.id)
          if (!cancelled) mergeServer(r.levels)
        } catch {
          /* sin conexión */
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.id, session?.username]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const retry = () => session && flushQueue(session, setSession)
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [session, setSession])

  const report = useCallback(
    (payload) => {
      if (payload.medals) record(payload.level - 1, payload.medals, payload.points)
      submitAttempt(session, payload, setSession)
    },
    [session, record, setSession],
  )

  const toggleMute = () => {
    initAudio()
    const m = !muted
    setMuted(m)
    setMutedState(m)
    if (!m) {
      startMusic()
      sfx.click()
    }
  }

  const level = LEVELS[levelIndex]

  return (
    <GameShell title="CodeQuest · Lógica de programación" css={css}>
      <div className={'wrap' + (screen === 'play' ? ' full' : '')}>
        {screen !== 'play' && (
          <>
            <h1>⚔️ CodeQuest</h1>
            <p className="sub">Aventura medieval para aprender lógica de programación con Python</p>
          </>
        )}

        {screen === 'register' && (
          <RegisterScreen
            initial={session}
            onStart={(s) => {
              setSession(s)
              setScreen('map')
            }}
          />
        )}

        {screen === 'map' && session && (
          <MapScreen
            session={session}
            progress={progress}
            muted={muted}
            onToggleMute={toggleMute}
            onOpen={(i) => {
              setLevelIndex(i)
              setScreen('play')
            }}
            onLogout={() => setScreen('register')}
          />
        )}

        {screen === 'play' && session && (
          <PlayScreen
            key={level.index}
            level={level}
            heroId={session.heroId}
            initialMask={progress.medalsOf(level.index)}
            hasNext={levelIndex < LEVELS.length - 1}
            onBack={() => setScreen('map')}
            onNext={() => setLevelIndex((i) => i + 1)}
            report={report}
          />
        )}
      </div>
    </GameShell>
  )
}
