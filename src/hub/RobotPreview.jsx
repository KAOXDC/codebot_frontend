import { useEffect, useRef } from 'react'
import { drawChar } from '../games/codebot/game/drawChar.js'

// Robot de CodeBot animado (respira y parpadea) para la tarjeta del menú.
export default function RobotPreview({ g }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current.getContext('2d')
    let raf
    const bucle = (ahora) => {
      c.clearRect(0, 0, 120, 140)
      drawChar(c, 60, 128, { g, dir: 2, t: ahora / 1000, mode: 'idle', s: 1.5 })
      raf = requestAnimationFrame(bucle)
    }
    raf = requestAnimationFrame(bucle)
    return () => cancelAnimationFrame(raf)
  }, [g])
  return <canvas ref={ref} width="120" height="140" aria-hidden="true" />
}
