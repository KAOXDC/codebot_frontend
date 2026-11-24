// Medallas: se guardan como máscara de bits (bronce = 1, plata = 2, oro = 4).
import { NEED_TEXT } from './levels.js'

export const BRONZE = 1
export const SILVER = 2
export const GOLD = 4

// Regex que comprueba que el código usa la estructura que pide el nivel
export const NEED_REGEX = {
  si: /\bif\b/,
  sino: /\b(else|elif)\b/,
  repetir: /\bfor\b/,
  mientras: /\bwhile\b/,
  hacer: /\bwhile\s+True\b/,
  funcion: /\bdef\b/,
  devolver: /\breturn\b/,
  pasos: /\bpasos\b/,
}

// Quita los comentarios de línea completa
export function stripComments(code) {
  return code
    .split('\n')
    .filter((x) => !/^\s*(#|\/\/)/.test(x))
    .join('\n')
    .trim()
}

export function countLines(code) {
  return stripComments(code)
    .split('\n')
    .filter((x) => x.trim()).length
}

export function usesRequiredStructure(level, code) {
  const sc = stripComments(code)
  return (level.need || []).every((k) => !NEED_REGEX[k] || NEED_REGEX[k].test(sc))
}

// Calcula las medallas de una ejecución que llegó a la meta.
// 0 = no usó la estructura pedida (no gana nada); si no, bronce y, según el caso, plata y oro.
export function medalMask(level, code, steps) {
  if (!usesRequiredStructure(level, code)) return 0
  let mask = BRONZE
  if (countLines(code) <= level.lines) mask |= SILVER
  if (steps <= level.opt) mask |= GOLD
  return mask
}

export function medalCount(mask) {
  return (mask & BRONZE ? 1 : 0) + (mask & SILVER ? 1 : 0) + (mask & GOLD ? 1 : 0)
}

export function medalEmojis(mask) {
  return (mask & BRONZE ? '🥉' : '') + (mask & SILVER ? '🥈' : '') + (mask & GOLD ? '🥇' : '')
}

export function missingStructureText(level) {
  return (level.need || []).map((k) => NEED_TEXT[k] || k).join(', ')
}

// Los tres retos de un nivel, para mostrarlos en la misión
export function challengesOf(level) {
  const need = (level.need || []).map((k) => NEED_TEXT[k]).filter(Boolean)
  return [
    { bit: BRONZE, icon: '🥉', text: 'Llega a la meta' + (need.length ? ' usando ' + need.join(', ') : '') },
    { bit: SILVER, icon: '🥈', text: 'Máximo ' + level.lines + ' líneas de código' },
    { bit: GOLD, icon: '🥇', text: 'Máximo ' + level.opt + ' pasos del héroe' },
  ]
}
