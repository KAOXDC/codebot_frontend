import { useEffect, useRef, useState } from 'react';
import StartScreen from './components/StartScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import EndScreen from './components/EndScreen.jsx';
import Panel from './pages/Panel.jsx';
import { Snd, sfx } from './game/audio.js';
import { api } from './api.js';

function Juego() {
  const [pantalla, setPantalla] = useState('inicio'); // inicio | juego | fin
  const [jugador, setJugador] = useState(null);
  const [final, setFinal] = useState(null);
  const [guardado, setGuardado] = useState(0);
  const [silencio, setSilencio] = useState(false);

  const jugadorRef = useRef(null);
  const partidaId = useRef(null);
  const cola = useRef(Promise.resolve());

  // Las llamadas al servidor van en cola para que lleguen en orden (partida → intentos → finalizar)
  const encolar = (fn) => {
    cola.current = cola.current.then(fn).catch(() => {});
    return cola.current;
  };

  const asegurarPartida = async () => {
    if (partidaId.current) return partidaId.current;
    try {
      const r = await api.crearPartida(jugadorRef.current);
      partidaId.current = r.partidaId;
    } catch {
      /* si el servidor no responde, el juego sigue funcionando sin registrar */
    }
    return partidaId.current;
  };

  const empezar = (datos) => {
    Snd.init();
    Snd.startMusic();
    sfx('click');
    jugadorRef.current = datos;
    setJugador(datos);
    setPantalla('juego');
    encolar(asegurarPartida);
  };

  const registrarIntento = (datos) =>
    encolar(async () => {
      const id = await asegurarPartida();
      if (id) await api.registrarIntento(id, datos);
    });

  const terminar = async (resultado) => {
    setFinal(resultado);
    setPantalla('fin');
    await encolar(async () => {
      const id = await asegurarPartida();
      if (id) await api.finalizarPartida(id);
    });
    setGuardado((g) => g + 1);
  };

  return (
    <>
      {pantalla === 'inicio' && <StartScreen onStart={empezar} />}
      {pantalla === 'juego' && <GameScreen jugador={jugador} onIntento={registrarIntento} onFin={terminar} />}
      {pantalla === 'fin' && <EndScreen jugador={jugador} final={final} guardando={guardado === 0} guardado={guardado} />}
      <button
        className="mute"
        title="Sonido"
        onClick={() => setSilencio(Snd.toggle())}
      >
        {silencio ? '🔇' : '🔊'}
      </button>
    </>
  );
}

export default function App() {
  const [ruta, setRuta] = useState(window.location.hash);
  useEffect(() => {
    const cambio = () => setRuta(window.location.hash);
    window.addEventListener('hashchange', cambio);
    return () => window.removeEventListener('hashchange', cambio);
  }, []);
  // El panel del profesor vive en  /#/panel
  return ruta.startsWith('#/panel') ? <Panel /> : <Juego />;
}
