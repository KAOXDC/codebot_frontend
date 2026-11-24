import { useEffect } from 'react'
import StyleScope from './StyleScope.jsx'
import shellCss from './shell.css?inline'

// Envuelve a un juego: carga solo el CSS de ese juego, cambia el título de la pestaña
// y pone el botón flotante "← Menú". Con confirmExit pide confirmación antes de salir
// (para no perder una partida en curso por un clic).
export default function GameShell({ title, css, confirmExit = false, children }) {
  useEffect(() => {
    const anterior = document.title
    document.title = title
    return () => {
      document.title = anterior
    }
  }, [title])

  const salir = (e) => {
    if (confirmExit && !window.confirm('¿Volver al menú? Se perderá la partida en curso (tiempo y puntos).')) {
      e.preventDefault()
    }
  }

  return (
    <>
      <StyleScope css={css + '\n' + shellCss} />
      {children}
      <a className="hubback" href="#/" onClick={salir}>← Menú</a>
    </>
  )
}
