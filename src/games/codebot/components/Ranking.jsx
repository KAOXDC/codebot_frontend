import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { fmt } from '../utils.js';

const MEDALLAS = ['🥇', '🥈', '🥉'];

export default function Ranking({ yo, filtro = {}, refrescar = 0 }) {
  const [filas, setFilas] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    setError(false);
    api
      .ranking(filtro)
      .then((r) => vivo && setFilas(r))
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, [refrescar, filtro.grupo, filtro.sesion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="note">No se pudo cargar el ranking. ¿Está encendido el servidor?</p>;
  if (!filas) return <p className="note">Cargando…</p>;
  if (!filas.length) return <p className="note">Aún no hay resultados.</p>;

  return (
    <ol className="rank">
      {filas.map((f, i) => (
        <li key={i} className={yo && f.nombre.toLowerCase() === yo.toLowerCase() ? 'me' : ''}>
          <span className="pos">{MEDALLAS[i] || i + 1}</span>
          <span className="nom">{f.nombre}{f.grupo ? <small> · {f.grupo}</small> : null}</span>
          <span className="pts">{f.puntos} pts · {fmt(f.tiempoMs)}</span>
        </li>
      ))}
    </ol>
  );
}
