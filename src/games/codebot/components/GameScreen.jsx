import { useEffect, useRef, useState } from 'react';
import Board from './Board.jsx';
import ProgramPanel from './ProgramPanel.jsx';
import LevelResult from './LevelResult.jsx';
import { LEVELS, TEMATICAS } from '../game/levels.js';
import { simular } from '../game/interpreter.js';
import { puntuarNivel, contarBloques } from '../game/scoring.js';
import { Snd, sfx } from '../game/audio.js';
import { fmt } from '../utils.js';
import { guardarPartida } from '../game/guardado.js';

const progVacio = () => ({ main: [], f1: [], f2: [] });

// onIntento(datos): se llama en cada ejecución (acierto o fallo) para registrar los datos
// onFin({ puntos, tiempoMs, intentos }): se llama al terminar el último nivel
export default function GameScreen({ jugador, inicial, getPartidaId, onIntento, onFin }) {
  const ini = inicial || {};
  const [idx, setIdx] = useState(ini.idx ?? 0);
  const [prog, setProg] = useState(() => ini.prog || progVacio());
  const [activa, setActiva] = useState('main');
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState(null);
  const [runs, setRuns] = useState(ini.runs ?? 0);
  const [puntos, setPuntos] = useState(ini.puntos ?? 0);
  const [resultado, setResultado] = useState(null);
  const [ahora, setAhora] = useState(Date.now());

  const t0 = useRef(Date.now() - (ini.tiempoMs || 0));
  const lvT0 = useRef(Date.now() - (ini.lvMs || 0));
  const lvRuns = useRef(ini.lvRuns || 0);
  const runsTotal = useRef(ini.runs || 0);
  const puntosRef = useRef(ini.puntos || 0);
  const board = useRef(null);
  const bloqueo = useRef(0); // evita que un doble clic caiga sobre la pantalla siguiente
  const ganado = useRef(false); // mientras se ve "¡Nivel completado!" ya hay un guardado propio
  const fin = useRef(false);
  const vivo = useRef({});

  const level = LEVELS[idx];
  vivo.current = { idx, prog };

  // Guarda la partida en el navegador para poder continuar si algo falla
  const guardar = (extra) => {
    guardarPartida({
      jugador,
      partidaId: getPartidaId?.() || null,
      idx: vivo.current.idx,
      prog: vivo.current.prog,
      puntos: puntosRef.current,
      runs: runsTotal.current,
      lvRuns: lvRuns.current,
      tiempoMs: Date.now() - t0.current,
      lvMs: Date.now() - lvT0.current,
      ...extra,
    });
  };
  useEffect(() => {
    if (!ganado.current) guardar();
  }, [idx, prog]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const alSalir = () => { if (!ganado.current && !fin.current) guardar(); };
    window.addEventListener('pagehide', alSalir);
    document.addEventListener('visibilitychange', alSalir);
    return () => {
      window.removeEventListener('pagehide', alSalir);
      document.removeEventListener('visibilitychange', alSalir);
    };
  }); // eslint-disable-line react-hooks/exhaustive-deps
  const bloqueado = () => Date.now() < bloqueo.current;

  // Cada temática tiene su propia pista cyberpunk
  useEffect(() => { Snd.setTrack(level.t); }, [level.t]);
  useEffect(() => () => Snd.setTrack(4), []);

  useEffect(() => {
    const iv = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(iv);
  }, []);

  const agregar = (k) => {
    if (ocupado || bloqueado()) return;
    const lim = activa === 'main' ? level.m : level[activa];
    if (!lim) return;
    if (prog[activa].length < lim) {
      setProg({ ...prog, [activa]: [...prog[activa], { t: k, n: 2 }] });
      sfx('click');
    } else {
      sfx('bump');
    }
  };

  const quitar = (fila, i) => {
    if (ocupado || bloqueado()) return;
    setProg({ ...prog, [fila]: prog[fila].filter((_, j) => j !== i) });
    sfx('remove');
  };

  const clicSlot = (fila, i) => {
    if (ocupado || bloqueado()) return;
    const b = prog[fila][i];
    if (b.t === 'REP') {
      const n = b.n >= 12 ? 2 : b.n + 1;
      setProg({ ...prog, [fila]: prog[fila].map((x, j) => (j === i ? { ...x, n } : x)) });
      sfx('click');
    } else {
      quitar(fila, i);
    }
  };

  const reiniciar = () => {
    if (ocupado || bloqueado()) return;
    setMsg(null);
    board.current?.reset();
  };

  const borrar = () => {
    if (ocupado || bloqueado()) return;
    setProg(progVacio());
    sfx('remove');
    reiniciar();
  };

  const terminarEjecucion = (r) => {
    const bloques = contarBloques(prog);
    const tiempoNivelMs = Date.now() - lvT0.current;

    if (r.ok) {
      const sc = puntuarNivel(level, tiempoNivelMs / 1000, bloques, lvRuns.current);
      puntosRef.current += sc.total;
      setPuntos(puntosRef.current);
      board.current.setMode('cheer');
      sfx('win');
      board.current.burst(['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#38bdf8'], 60);
      onIntento({
        nivel: idx + 1,
        exito: true,
        bloques,
        tiempoNivelMs,
        programa: prog,
        puntos: { base: sc.base, rapidez: sc.rapidez, intentos: sc.intentos, bloques: sc.bloques },
      });
      // Guarda ya el avance: si algo falla en la pantalla de victoria, se continúa en el nivel siguiente
      ganado.current = true;
      const ultimo = idx === LEVELS.length - 1;
      guardar({ idx: ultimo ? idx : idx + 1, prog: progVacio(), lvRuns: 0, lvMs: 0, finalPendiente: ultimo });
      setTimeout(() => setResultado({ sc, intentos: lvRuns.current, total: puntosRef.current }), 1100);
    } else {
      board.current.setMode('sad');
      sfx('lose');
      setMsg({ texto: r.mensaje, reiniciar: true });
      onIntento({ nivel: idx + 1, exito: false, motivo: r.motivo, bloques, tiempoNivelMs, programa: prog });
    }
  };

  const ejecutar = () => {
    if (ocupado || bloqueado()) return;
    Snd.init();
    const r = simular(level, prog);
    if (r.vacio) {
      setMsg({ texto: 'Tu programa está vacío 🙂' });
      return;
    }
    runsTotal.current++;
    lvRuns.current++;
    setRuns(runsTotal.current);
    setOcupado(true);
    setMsg(null);
    board.current.reset();
    board.current.play(r.ev, () => {
      setOcupado(false);
      terminarEjecucion(r);
    });
  };

  const siguiente = () => {
    // Un segundo clic (doble clic) o un clic fuera de tiempo no debe saltar de nivel dos veces ni pulsar botones de abajo
    if (bloqueado() || fin.current) return;
    bloqueo.current = Date.now() + 900;
    sfx('click');
    if (idx === LEVELS.length - 1) {
      fin.current = true;
      onFin({ puntos: puntosRef.current, tiempoMs: Date.now() - t0.current, intentos: runsTotal.current });
      return;
    }
    setIdx(idx + 1);
    setProg(progVacio());
    setActiva('main');
    setMsg(null);
    setResultado(null);
    lvRuns.current = 0;
    lvT0.current = Date.now();
    ganado.current = false;
  };

  return (
    <div className="wrap">
      <div className="card" id="top">
        <div>
          <b style={{ fontSize: 17 }}>Nivel {idx + 1} de {LEVELS.length} · {level.n}</b>
          <div className="chips" style={{ margin: '6px 0 0' }}>
            {TEMATICAS.map((t, k) => (
              <span key={t.nombre} className={'chip' + (k === level.t ? ' on' : k < level.t ? ' done' : '')}>{t.nombre}</span>
            ))}
          </div>
        </div>
        <div className="stats">
          <span className="pill">👤 <b>{jugador.nombre}</b></span>
          <span className="pill">⏱ <b>{fmt(ahora - t0.current)}</b></span>
          <span className="pill">▶ <b>{runs}</b></span>
          <span className="pill">⭐ <b>{puntos}</b> pts</span>
        </div>
      </div>

      <div id="game">
        <div className="card cvw">
          <Board ref={board} level={level} gender={jugador.genero} />
          {msg && (
            <div className="msg">
              {msg.texto}
              {msg.reiniciar && <button className="go" style={{ marginLeft: 8 }} onClick={reiniciar}>Reiniciar</button>}
            </div>
          )}
        </div>
        <ProgramPanel
          level={level}
          prog={prog}
          activa={activa}
          ocupado={ocupado}
          onActiva={setActiva}
          onAgregar={agregar}
          onSlot={clicSlot}
          onQuitar={quitar}
          onEjecutar={ejecutar}
          onReiniciar={reiniciar}
          onBorrar={borrar}
        />
      </div>

      {resultado && (
        <LevelResult
          nivel={idx + 1}
          r={resultado.sc}
          intentos={resultado.intentos}
          total={resultado.total}
          ultimo={idx === LEVELS.length - 1}
          onNext={siguiente}
        />
      )}
    </div>
  );
}
