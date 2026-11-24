// Imágenes PNG del juego (héroes e islas de los mundos). Vite las empaqueta con su URL final.
import guerrero from '../assets/heroes/guerrero.png'
import arquero from '../assets/heroes/arquero.png'
import maga from '../assets/heroes/maga.png'
import ladrona from '../assets/heroes/ladrona.png'
import forest from '../assets/islands/isla_forest.png'
import volcano from '../assets/islands/isla_volcano.png'
import sea from '../assets/islands/isla_sea.png'
import sky from '../assets/islands/isla_sky.png'
import ice from '../assets/islands/isla_ice.png'
import castle from '../assets/islands/isla_castle.png'

export const FRAME = 32 // cada fotograma mide 32x32 px
export const IDLE_FRAMES = 4 // fotogramas 0-3: reposo
export const ATTACK_FRAMES = 3 // fotogramas 4-6: ataque

export const HERO_URLS = { guerrero, arquero, maga, ladrona }
export const ISLAND_URLS = [forest, volcano, sea, sky, ice, castle]

const cache = {}
export function loadImage(url) {
  if (!cache[url]) {
    const img = new Image()
    img.src = url
    cache[url] = img
  }
  return cache[url]
}

export const heroSheet = (id) => loadImage(HERO_URLS[id] || HERO_URLS.guerrero)

// Precarga todo al abrir el juego para que no haya parpadeos
export function preloadAll() {
  Object.values(HERO_URLS).forEach(loadImage)
  ISLAND_URLS.forEach(loadImage)
}
