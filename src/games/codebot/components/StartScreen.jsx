import { useState } from 'react';
import CharacterPicker from './CharacterPicker.jsx';
import Ranking from './Ranking.jsx';
import { TEMATICAS, LEVELS } from '../game/levels.js';

export default function StartScreen({ onStart }) {
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
        <div className="card">
          <div className="brand">
            <span className="logo">🤖</span>
            <h1>CodeBot</h1>
          </div>
          <p className="lead">
            Programa a tu robot para encender todas las bombillas 💡. Son <b>{LEVELS.length} niveles</b> en{' '}
            {TEMATICAS.length} temáticas de lógica (≈ 1 hora). Ganas puntos por rapidez, pocos intentos y pocos
            bloques. ¡Gana quien termine con más puntos y menos tiempo!
          </p>
          <div className="chips">
            {TEMATICAS.map((t, i) => (
              <span className="chip" key={t.nombre}>{i + 1} · {t.nombre}</span>
            ))}
          </div>

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
        </div>

        <div className="card">
          <h2>🏆 Ranking</h2>
          <Ranking filtro={filtro} />
        </div>
      </div>
    </div>
  );
}
