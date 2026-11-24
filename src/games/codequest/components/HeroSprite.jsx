import { useEffect, useRef } from 'react'
import { heroSheet, FRAME, IDLE_FRAMES } from '../render/assets.js'

// Héroe animado (fotogramas de reposo del sprite PNG). Usa un tamaño múltiplo de 32 para que los píxeles queden nítidos.
export default function HeroSprite({ hero, size = 96 }) {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    const img = heroSheet(hero.id)
    let i = 0
    const pintar = () => {
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, FRAME, FRAME)
      if (img.complete && img.naturalWidth) ctx.drawImage(img, i * FRAME, 0, FRAME, FRAME, 0, 0, FRAME, FRAME)
    }
    pintar()
    img.addEventListener('load', pintar)
    const iv = setInterval(() => {
      i = (i + 1) % IDLE_FRAMES
      pintar()
    }, 260)
    return () => {
      clearInterval(iv)
      img.removeEventListener('load', pintar)
    }
  }, [hero])
  return <canvas ref={ref} width={FRAME} height={FRAME} style={{ width: size, height: size, imageRendering: 'pixelated' }} aria-hidden="true" />
}
