import { useId } from 'react'

// Panel desplegable: el contenido empuja lo de abajo (no se encima) y puede cerrarse.
export default function Acordeon({ titulo, abierto, onToggle, children, className = '' }) {
  const id = useId()
  return (
    <div className={'acc ' + className + (abierto ? ' open' : '')}>
      <button type="button" className="acch" aria-expanded={abierto} aria-controls={id} onClick={onToggle}>
        <span>{titulo}</span>
        <i aria-hidden="true">▾</i>
      </button>
      <div className="accb" id={id} role="region" hidden={!abierto}>
        {children}
      </div>
    </div>
  )
}
