// Sprites de los 4 héroes (cuadrícula 16x16; cada letra es un color de PALETTE).
// Dos masculinos (guerrero, arquero) y dos femeninos (maga, ladrona).

export const PALETTE = {
  '.': null, k: '#1a1020', s: '#f2c9a0', S: '#d9a574',
  g: '#9aa3b5', G: '#6b7385', r: '#c0392b', R: '#8e2a20',
  b: '#3b6fd4', B: '#25469a', p: '#8e44ad', P: '#5e2c78',
  y: '#ffd166', Y: '#c9962e', n: '#7a4a2b', N: '#4d2d18',
  h: '#3a2a1a', H: '#d4a017', o: '#e67e22', e: '#2e8b57', E: '#1c5c3a', w: '#ffffff', l: '#e6b8e6',
}

export const HERO_COLORS = {
  guerrero: '#e5e7eb',
  arquero: '#86efac',
  maga: '#c084fc',
  ladrona: '#fda4af',
}

export const HEROES = [
  { id: 'guerrero', name: 'Aldric', role: 'Guerrero', pixels: [
    '.....gggg.......',
    '....gGggGg......',
    '....gssssg......',
    '....gskskg......',
    '.....ssss.......',
    '....rrrrrr......',
    '...rgrrrrgr.....',
    '..ssgrrrrgss....',
    '..ss.rYYr.ss....',
    '.GGG.rrrr.ssw...',
    '.GGG.hhhh..w....',
    '.....hhhh..w....',
    '....nn..nn.y....',
    '....nn..nn......',
    '...kkk..kkk.....',
    '................'] },
  { id: 'arquero', name: 'Robin', role: 'Arquero', pixels: [
    '.....eeee.......',
    '....eEeeEe......',
    '....eeeeee......',
    '....esssse......',
    '....eskske......',
    '.....ssss.......',
    '....eeeeee.n....',
    '...eeEeeEenn....',
    '..ss.eeee.n.n...',
    '..ss.hhhh.n..n..',
    '.n...hhhh.n.n...',
    '.n...hhhh.nn....',
    '....nn..nn.n....',
    '....nn..nn......',
    '...kkk..kkk.....',
    '................'] },
  { id: 'maga', name: 'Selene', role: 'Maga', pixels: [
    '......pp........',
    '.....pppp.......',
    '....pppppp......',
    '...pppppppp.....',
    '....hssssh......',
    '....hskskh......',
    '....hhssh.......',
    '....pppppp..y...',
    '...ppPppPpp.n...',
    '..ss.pppp.s.n...',
    '..ss.pyyp...n...',
    '.....pppp...n...',
    '....pppppp..n...',
    '...pppppppp.n...',
    '...kk....kk.....',
    '................'] },
  { id: 'ladrona', name: 'Nyra', role: 'Ladrona', pixels: [
    '.....kkkk.......',
    '....kkkkkk......',
    '....kssssk......',
    '....kskskk......',
    '....kkssk.......',
    '.....kkkk.......',
    '....BBbbBB......',
    '...BbBbbBbB.....',
    '..ss.BbbB.ss....',
    '..ss.HHHH.ss.g..',
    '.....bbbb...g...',
    '.....bbbb..Y....',
    '....bb..bb......',
    '....bb..bb......',
    '...kkk..kkk.....',
    '................'] },
]

export const HERO_IDS = HEROES.map((h) => h.id)

export function getHero(id) {
  return HEROES.find((h) => h.id === id) || HEROES[0]
}
