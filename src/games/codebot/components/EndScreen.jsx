import Ranking from './Ranking.jsx';
import { fmt } from '../utils.js';

export default function EndScreen({ jugador, final, guardando, guardado }) {
  const params = new URLSearchParams(window.location.search);
  const filtro = { grupo: params.get('grupo') || '', sesion: params.get('sesion') || '' };

  return (
    <div className="wrap">
      <div className="card" style={{ maxWidth: 560, margin: '20px auto', textAlign: 'center' }}>
        <h1>🎉 ¡Terminaste, {jugador.nombre}!</h1>
        <p className="big" style={{ margin: '14px 0 4px' }}>{final.puntos}</p>
        <div className="note" style={{ margin: '0 0 10px' }}>puntos</div>
        <p>Tiempo total: <b>{fmt(final.tiempoMs)}</b> · Intentos: <b>{final.intentos}</b></p>
        {guardando && <p className="note">Guardando tu resultado…</p>}
        <h2 style={{ marginTop: 14 }}>🏆 Ranking</h2>
        <div style={{ textAlign: 'left' }}>
          <Ranking yo={jugador.nombre} filtro={filtro} refrescar={guardado} />
        </div>
        <p>
          <button className="go" onClick={() => window.location.reload()}>Jugar de nuevo</button>
        </p>
      </div>
    </div>
  );
}
