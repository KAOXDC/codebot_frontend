import { useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import StyleScope from '../shell/StyleScope.jsx'
import hubCss from './hub.css?inline'
import RobotPreview from './RobotPreview.jsx'
import HeroSprite from '../games/codequest/components/HeroSprite.jsx'
import { HEROES } from '../games/codequest/engine/heroes.js'
import { LEVEL_COUNT, WORLDS } from '../games/codequest/engine/levels.js'
import { LEVELS as CODEBOT_LEVELS, TEMATICAS } from '../games/codebot/game/levels.js'

const lista = { oculto: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }
const sube = { oculto: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } } }

// Personaje que flota suavemente (cada uno con su retraso)
function Flota({ children, i = 0, quieto }) {
  return (
    <motion.div
      animate={quieto ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
      style={{ display: 'flex' }}
    >
      {children}
    </motion.div>
  )
}

// Menú de inicio: elige el juego.
export default function Hub() {
  const quieto = useReducedMotion()

  useEffect(() => {
    const anterior = document.title
    document.title = 'Juegos de lógica de programación'
    return () => {
      document.title = anterior
    }
  }, [])

  const hover = quieto ? undefined : { y: -8, scale: 1.02 }
  const tap = quieto ? undefined : { scale: 0.985 }

  return (
    <>
      <StyleScope css={hubCss} />
      <div className="blobs" aria-hidden="true">
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
      </div>
      <motion.main className="hub" variants={lista} initial="oculto" animate="visible">
        <motion.span className="eyebrow" variants={sube}>🎮 Juegos de lógica</motion.span>
        <motion.h1 variants={sube}>
          Aprende lógica de <span className="grad">programación</span> jugando
        </motion.h1>
        <motion.p className="lead" variants={sube}>Elige un juego para empezar</motion.p>

        <div className="games">
          <motion.a className="gcard bot" href="#/codebot" variants={sube} whileHover={hover} whileTap={tap}>
            <div className="art">
              <Flota quieto={quieto}><RobotPreview g="m" /></Flota>
              <Flota quieto={quieto} i={1}><RobotPreview g="f" /></Flota>
            </div>
            <span className="tag">Con bloques</span>
            <h2>CodeBot</h2>
            <p>Programa a tu robot armando bloques para encender todas las bombillas. Secuencias, funciones, bucles y condicionales.</p>
            <div className="chips">
              <span>{CODEBOT_LEVELS.length} niveles</span>
              <span>{TEMATICAS.length} temáticas</span>
              <span>≈ 1 hora</span>
              <span>Ranking</span>
            </div>
            <span className="play">Jugar CodeBot <b className="arr">→</b></span>
          </motion.a>

          <motion.a className="gcard quest" href="#/codequest" variants={sube} whileHover={hover} whileTap={tap}>
            <div className="art px">
              {HEROES.map((h, i) => (
                <Flota key={h.id} quieto={quieto} i={i}>
                  <HeroSprite hero={h} size={72} />
                </Flota>
              ))}
            </div>
            <span className="tag">Con código Python</span>
            <h2>CodeQuest</h2>
            <p>Escribe código en Python para guiar a tu héroe por las mazmorras: variables, condicionales, for, while y funciones.</p>
            <div className="chips">
              <span>{LEVEL_COUNT} niveles</span>
              <span>{WORLDS.length} mundos</span>
              <span>4 héroes</span>
              <span>Medallas</span>
            </div>
            <span className="play">Jugar CodeQuest <b className="arr">→</b></span>
          </motion.a>
        </div>

        <motion.p className="foot" variants={sube}>
          <a href="#/panel">Panel del profesor</a>
        </motion.p>
      </motion.main>
    </>
  )
}
