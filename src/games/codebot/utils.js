// Formatea milisegundos como mm:ss
export const fmt = (ms) => {
  if (ms == null) return '—';
  const s = Math.floor(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};
