import { useLayoutEffect } from 'react'

// Inserta una hoja de estilos en <head> mientras el componente está montado y la quita al desmontarse.
// Así el CSS de un juego nunca se mezcla con el del otro ni con el del menú.
export default function StyleScope({ css }) {
  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    return () => el.remove()
  }, [css])
  return null
}
