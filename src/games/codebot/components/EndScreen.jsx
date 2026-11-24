import { useEffect } from 'react';
import { motion } from 'motion/react';
import { lluviaFinal } from '../../../shell/fx.js';
import Ranking from './Ranking.jsx';
import { fmt } from '../utils.js';

export default function EndScreen({ jugador, final, guardando, guardado }) {
  const params = new URLSearchParams(window.location.search);
  const filtro = { grupo: params.get('grupo') || '', sesion: params.get('sesion') || '' };

  useEffect(() => { lluviaFinal(); }, []);

  return (
    <div className="wrap">
      <motion.div className="card" style={{ maxWidth: 560, margin: '20px auto', textAlign: 'center' }} initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
        <h1>🎉 ¡Terminaste, {jugador.nombre}!</h1>
        <motion.p className="big" style={{ margin: '14px 0 4px' }} initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.25, 1] }} transition={{ delay: 0.25, duration: 0.6 }}>{final.puntos}</motion.p>
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
      </motion.div>
    </div>
  );
}
