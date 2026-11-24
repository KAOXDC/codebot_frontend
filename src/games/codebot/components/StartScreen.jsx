import { useState } from 'react';
import { motion } from 'motion/react';
import CharacterPicker from './CharacterPicker.jsx';
import Ranking from './Ranking.jsx';
import { TEMATICAS, LEVELS } from '../game/levels.js';

export default function StartScreen({ onStart, guardada, onContinuar, onDescartar }) {
  // El profesor puede compartir un enlace con el grupo y la sesión ya puestos:
  //   https://tu-sitio/?grupo=A&sesion=Clase1
  const params = new URLSearchParams(window.location.search);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState(params.get('grupo') || '');
  const [sesion, setSesion] = useState(params.get('sesion') || '');
  const [genero, setGenero] = useState('m');
  const [error, setError] = useState('');

  const empezar = () => {
    const n = nombre.trim();
    if (!n) return setError('Escribe tu nombre');
    onStart({ nombre: n, grupo: grupo.trim(), sesion: sesion.trim(), genero });
  };

  const filtro = { grupo: params.get('grupo') || '', sesion: params.get('sesion') || '' };

  return (
    <div className="wrap">
      <div id="start">
        <motion.div className="card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
          <div className="brand">
            <motion.span className="logo" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }}>🤖</motion.span>
            <h1>CodeBot</h1>
          </div>
          <p className="lead">
            Programa a tu robot para encender todas las bombillas 💡. Son <b>{LEVELS.length} niveles</b> en{' '}
            {TEMATICAS.length} temáticas de lógica (≈ 1 hora). Ganas puntos por rapidez, pocos intentos y pocos
            bloques. ¡Gana quien termine con más puntos y menos tiempo!
          </p>
          <div className="chips">
            {TEMATICAS.map((t, i) => (
              <motion.span className={'chip c' + (i % 4)} key={t.nombre} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}>
                {i + 1} · {t.nombre}
              </motion.span>
            ))}
          </div>

          {guardada && (
            <div className="resume">
              <div>
                <b>Tienes una partida guardada</b>
                <div className="note">
                  👤 {guardada.jugador.nombre} · Nivel {Math.min(guardada.idx + 1, LEVELS.length)} de {LEVELS.length} · ⭐ {guardada.puntos || 0} pts
                </div>
              </div>
              <div className="resbtn">
                <button className="go" onClick={onContinuar}>Continuar ▶</button>
                <button className="sec" onClick={onDescartar}>Descartar</button>
              </div>
            </div>
          )}

          <div className="lbl">Tu nombre</div>
          <input
            type="text"
            maxLength={20}
            placeholder="Nombre o apodo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && empezar()}
          />

          <div className="dos">
            <div>
              <div className="lbl">Grupo (opcional)</div>
              <input type="text" maxLength={30} placeholder="Ej. A" value={grupo} onChange={(e) => setGrupo(e.target.value)} />
            </div>
            <div>
              <div className="lbl">Sesión (opcional)</div>
              <input type="text" maxLength={30} placeholder="Ej. Clase 1" value={sesion} onChange={(e) => setSesion(e.target.value)} />
            </div>
          </div>

          <div className="lbl">Elige tu personaje</div>
          <CharacterPicker genero={genero} onChange={setGenero} />

          <p style={{ margin: '16px 0 0' }}>
            <button className="go" onClick={empezar}>¡Empezar!</button>
          </p>
          {error && <p className="error">{error}</p>}
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.12 }}>
          <h2>🏆 Ranking</h2>
          <Ranking filtro={filtro} />
        </motion.div>
      </div>
    </div>
  );
}
