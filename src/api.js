// Cliente de la API. En desarrollo usa el proxy de Vite (/api); en producción VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const qs = (q = {}) => {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

async function peticion(ruta, { method = 'GET', body, adminKey, raw } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (adminKey) headers['x-admin-key'] = adminKey;
  const res = await fetch(BASE + ruta, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    const err = new Error(info.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return raw ? res : res.json();
}

// Reintenta si el servidor no responde (no reintenta errores 4xx)
async function conReintentos(fn, veces = 4) {
  let ultimo;
  for (let i = 0; i < veces; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimo = e;
      if (e.status && e.status < 500) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw ultimo;
}

export const api = {
  crearPartida: (datos) => conReintentos(() => peticion('/partidas', { method: 'POST', body: datos })),
  registrarIntento: (id, datos) =>
    conReintentos(() => peticion(`/partidas/${id}/intentos`, { method: 'POST', body: datos })),
  finalizarPartida: (id) =>
    conReintentos(() => peticion(`/partidas/${id}/finalizar`, { method: 'POST', body: {} })),
  ranking: (filtro) => peticion('/ranking' + qs(filtro)),
  estadisticas: (clave, filtro) => peticion('/estadisticas' + qs(filtro), { adminKey: clave }),
  descargarCSV: async (clave, filtro) => {
    const res = await peticion('/exportar/resultados.csv' + qs(filtro), { adminKey: clave, raw: true });
    return res.blob();
  },
};
