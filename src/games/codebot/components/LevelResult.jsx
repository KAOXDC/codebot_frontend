import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { sfx } from '../game/audio.js';
import { celebrar } from '../../../shell/fx.js';

const F = { o: { opacity: 0, x: -14 }, v: { opacity: 1, x: 0 } };

// Pantalla que aparece al completar un nivel: estrellas, puntos y desglose
export default function LevelResult({ nivel, r, intentos, total, ultimo, onNext }) {
  const [estrellas, setEstrellas] = useState(0);
  const [cuenta, setCuenta] = useState(0);

  useEffect(() => {
    const timers = [setTimeout(() => celebrar(r.estrellas / 3 + 0.4), 250)];
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
    <motion.div className="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="box" initial={{ scale: 0.7, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
        <h2>¡Nivel {nivel} completado!</h2>
        <div className="stars">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={'star' + (i < estrellas ? ' on' : '')}
              animate={i < estrellas ? { scale: [0.4, 1.6, 1], rotate: [-40, 15, 0], opacity: 1 } : { scale: 0.6, opacity: 0.25 }}
              transition={{ duration: 0.5 }}
            >⭐</motion.span>
          ))}
        </div>
        <div className="big">{cuenta}</div>
        <div className="note">puntos en este nivel</div>
        <motion.div className="brk" initial="o" animate="v" variants={{ v: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}>
          <motion.div variants={F}><span>Nivel superado</span><span>+{r.base}</span></motion.div>
          <motion.div variants={F}><span>⏱ Rapidez ({r.segundos}s)</span><span>+{r.rapidez}</span></motion.div>
          <motion.div variants={F}><span>▶ Pocos intentos ({intentos})</span><span>+{r.intentos}</span></motion.div>
          <motion.div variants={F}><span>🧩 Pocos bloques ({r.bloquesUsados})</span><span>+{r.bloques}</span></motion.div>
        </motion.div>
        <div className="tot">Total acumulado: <b>{total} pts</b></div>
        <button className="go" onClick={onNext}>{ultimo ? 'Ver resultado final 🏁' : 'Siguiente nivel →'}</button>
      </motion.div>
    </motion.div>
  );
}
