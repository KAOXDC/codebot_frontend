import { useEffect, useRef } from 'react';
import { drawChar } from '../game/drawChar.js';

function Muneco({ g, seleccionado, onElegir, etiqueta }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current.getContext('2d');
    let raf;
    const bucle = (ahora) => {
      c.clearRect(0, 0, 130, 130);
      drawChar(c, 65, 112, { g, dir: 2, t: ahora / 1000, mode: 'idle', s: 1.45 });
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);
    return () => cancelAnimationFrame(raf);
  }, [g]);

  return (
    <div
      className={'char' + (seleccionado ? ' sel' : '')}
      role="button"
      tabIndex={0}
      aria-label={etiqueta}
      onClick={onElegir}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onElegir()}
    >
      <canvas ref={ref} width="130" height="130" />
    </div>
  );
}

// Selector de personaje: solo los dos muñecos, sin texto
export default function CharacterPicker({ genero, onChange }) {
  return (
    <div className="chars">
      <Muneco g="m" seleccionado={genero === 'm'} onElegir={() => onChange('m')} etiqueta="Personaje chico" />
      <Muneco g="f" seleccionado={genero === 'f'} onElegir={() => onChange('f')} etiqueta="Personaje chica" />
    </div>
  );
}
