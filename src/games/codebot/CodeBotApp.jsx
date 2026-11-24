import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import GameShell from '../../shell/GameShell.jsx'
import css from './styles.css?inline'
import StartScreen from './components/StartScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import EndScreen from './components/EndScreen.jsx'
import { Snd, sfx } from './game/audio.js'
import { api } from './api.js'

export default function CodeBotApp() {
  const [pantalla, setPantalla] = useState('inicio') // inicio | juego | fin
  const [jugador, setJugador] = useState(null)
  const [final, setFinal] = useState(null)
  const [guardado, setGuardado] = useState(0)
  const [silencio, setSilencio] = useState(Snd.muted)

  const jugadorRef = useRef(null)
  const partidaId = useRef(null)
  const cola = useRef(Promise.resolve())

  // Al volver al menú se apaga la música de este juego
  useEffect(() => () => Snd.stopMusic(), [])

  // Las llamadas al servidor van en cola para que lleguen en orden (partida → intentos → finalizar)
  const encolar = (fn) => {
    cola.current = cola.current.then(fn).catch(() => {})
    return cola.current
  }

  const asegurarPartida = async () => {
    if (partidaId.current) return partidaId.current
    try {
      const r = await api.crearPartida(jugadorRef.current)
      partidaId.current = r.partidaId
    } catch {
      /* si el servidor no responde, el juego sigue funcionando sin registrar */
    }
    return partidaId.current
  }

  const empezar = (datos) => {
    Snd.init()
    Snd.startMusic()
    sfx('click')
    jugadorRef.current = datos
    setJugador(datos)
    setPantalla('juego')
    encolar(asegurarPartida)
  }

  const registrarIntento = (datos) =>
    encolar(async () => {
      const id = await asegurarPartida()
      if (id) await api.registrarIntento(id, datos)
    })

  const terminar = async (resultado) => {
    setFinal(resultado)
    setPantalla('fin')
    await encolar(async () => {
      const id = await asegurarPartida()
      if (id) await api.finalizarPartida(id)
    })
    setGuardado((g) => g + 1)
  }

  return (
    <GameShell title="CodeBot · Lógica de programación" css={css} confirmExit={pantalla === 'juego'}>
      <div className="bgdecor" aria-hidden="true"><i /><i /><i /></div>
      <AnimatePresence mode="wait">
        <motion.div
          key={pantalla}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          {pantalla === 'inicio' && <StartScreen onStart={empezar} />}
          {pantalla === 'juego' && <GameScreen jugador={jugador} onIntento={registrarIntento} onFin={terminar} />}
          {pantalla === 'fin' && <EndScreen jugador={jugador} final={final} guardando={guardado === 0} guardado={guardado} />}
        </motion.div>
      </AnimatePresence>
      <button className="mute" title="Sonido" onClick={() => setSilencio(Snd.toggle())}>
        {silencio ? '🔇' : '🔊'}
      </button>
    </GameShell>
  )
}
