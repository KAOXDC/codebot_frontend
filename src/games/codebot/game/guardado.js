// Guarda la partida en el navegador para poder continuar si algo falla (recarga, cierre, doble clic, sin internet...)
const CLAVE = 'codebot_partida_v1';
const MAX_EDAD = 1000 * 60 * 60 * 24 * 7; // 7 días

export function leerPartida() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (!s || s.v !== 1 || !s.jugador?.nombre || !Number.isInteger(s.idx) || s.idx < 0) return null;
    if (Date.now() - (s.guardadoEn || 0) > MAX_EDAD) return null;
    return s;
  } catch {
    return null;
  }
}

export function guardarPartida(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: 1, ...estado, guardadoEn: Date.now() }));
  } catch {
    /* sin almacenamiento: el juego sigue igual */
  }
}

export function borrarPartida() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* nada */
  }
}
