import { useEffect, useState } from 'react';
import { sfx } from '../game/audio.js';

// Pantalla que aparece al completar un nivel: estrellas, puntos y desglose
export default function LevelResult({ nivel, r, intentos, total, ultimo, onNext }) {
  const [estrellas, setEstrellas] = useState(0);
  const [cuenta, setCuenta] = useState(0);

  useEffect(() => {
    const timers = [];
    for (let i = 0; i < r.estrellas; i++) {
      timers.push(
        setTimeout(() => {
          setEstrellas(i + 1);
          sfx('star', i);
        }, 300 + i * 350)
      );
    }
    let v = 0;
    const paso = Math.max(1, Math.round(r.total / 30));
    const iv = setInterval(() => {
      v = Math.min(r.total, v + paso);
      setCuenta(v);
      if (v >= r.total) clearInterval(iv);
    }, 30);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [r]);

  return (
    <div className="ov">
      <div className="box">
        <h2>¡Nivel {nivel} completado!</h2>
        <div className="stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={'star' + (i < estrellas ? ' on' : '')}>⭐</span>
          ))}
        </div>
        <div className="big">{cuenta}</div>
        <div className="note">puntos en este nivel</div>
        <div className="brk">
          <div><span>Nivel superado</span><span>+{r.base}</span></div>
          <div><span>⏱ Rapidez ({r.segundos}s)</span><span>+{r.rapidez}</span></div>
          <div><span>▶ Pocos intentos ({intentos})</span><span>+{r.intentos}</span></div>
          <div><span>🧩 Pocos bloques ({r.bloquesUsados})</span><span>+{r.bloques}</span></div>
        </div>
        <div className="tot">Total acumulado: <b>{total} pts</b></div>
        <button className="go" onClick={onNext}>{ultimo ? 'Ver resultado final 🏁' : 'Siguiente nivel →'}</button>
      </div>
    </div>
  );
}
