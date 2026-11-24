import { useEffect, useRef } from 'react'
import { drawSprite } from '../render/sprites.js'

// Dibuja el sprite de un héroe en un canvas pequeño (pantalla de registro).
export default function HeroSprite({ hero, size = 96 }) {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    ctx.clearRect(0, 0, 128, 128)
    drawSprite(ctx, hero.pixels, 0, 0, 8, false)
  }, [hero])
  return <canvas ref={ref} width={128} height={128} style={{ width: size, height: size }} aria-hidden="true" />
}
