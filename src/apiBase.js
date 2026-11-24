// URL base de la API (sin barra final). Cada juego añade su propio prefijo: /codebot o /codequest.
export const API_BASE = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '')
