import { useEffect } from 'react'
import StyleScope from '../shell/StyleScope.jsx'
import hubCss from './hub.css?inline'
import RobotPreview from './RobotPreview.jsx'
import HeroSprite from '../games/codequest/components/HeroSprite.jsx'
import { HEROES } from '../games/codequest/engine/heroes.js'
import { LEVEL_COUNT, WORLDS } from '../games/codequest/engine/levels.js'
import { LEVELS as CODEBOT_LEVELS, TEMATICAS } from '../games/codebot/game/levels.js'

// Menú de inicio: elige el juego.
export default function Hub() {
  useEffect(() => {
    const anterior = document.title
    document.title = 'Juegos de lógica de programación'
    return () => {
      document.title = anterior
    }
  }, [])

  return (
    <>
      <StyleScope css={hubCss} />
      <main className="hub">
        <h1>Aprende lógica de programación jugando</h1>
        <p className="lead">Elige un juego para empezar</p>

        <div className="games">
          <a className="gcard bot" href="#/codebot">
            <div className="art">
              <RobotPreview g="m" />
              <RobotPreview g="f" />
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
            <span className="play">Jugar CodeBot →</span>
          </a>

          <a className="gcard quest" href="#/codequest">
            <div className="art px">
              {HEROES.map((h) => (
                <HeroSprite key={h.id} hero={h} size={72} />
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
            <span className="play">Jugar CodeQuest →</span>
          </a>
        </div>

        <p className="foot">
          <a href="#/panel">Panel del profesor</a>
        </p>
      </main>
    </>
  )
}
