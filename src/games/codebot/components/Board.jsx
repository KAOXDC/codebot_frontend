import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { renderScene } from '../game/renderer.js';
import { sfx } from '../game/audio.js';

// Duración (ms) de cada tipo de movimiento
const DUR = { walk: 420, jump: 560, turn: 300, bulb: 520, bump: 260 };
const MODOS = { walk: 'walk', jump: 'jump', turn: 'turn', bulb: 'bulb', bump: 'idle' };

const vistaInicial = (level) => {
  const [x, y, d] = level.s;
  return { cx: x, cy: y, fx: x, fy: y, tx: x, ty: y, e: 0, dir: d, lit: [], mode: 'idle', p: 0, sx: 0, sy: 0 };
};

// Tablero isométrico en canvas. Expone por ref: play(eventos, alTerminar), reset(), setMode(m), burst(colores, n)
const Board = forwardRef(function Board({ level, gender }, ref) {
  const canvasRef = useRef(null);
  const props = useRef({ level, gender });
  props.current = { level, gender };
  const estado = useRef({ view: null, particles: [], runId: 0 });
  if (!estado.current.view) estado.current.view = vistaInicial(level);

  // Al cambiar de nivel, el robot vuelve a la salida
  useEffect(() => {
    const e = estado.current;
    e.runId++;
    e.particles.length = 0;
    e.view = vistaInicial(level);
  }, [level]);

  // Bucle de dibujo
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const bucle = (ahora) => {
      const e = estado.current;
      renderScene(ctx, canvas, props.current.level, e.view, e.particles, props.current.gender, ahora);
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(raf);
      estado.current.runId++;
    };
  }, []);

  useImperativeHandle(ref, () => {
    const lanzarChispas = (colores, n) => {
      const e = estado.current;
      for (let i = 0; i < n; i++) {
        e.particles.push({
          x: e.view.sx || 320,
          y: (e.view.sy || 200) - 30,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 5 - 1,
          s: 3 + Math.random() * 3,
          life: 1,
          c: colores[i % colores.length],
        });
      }
    };

    return {
      reset() {
        const e = estado.current;
        e.runId++;
        e.particles.length = 0;
        e.view = vistaInicial(props.current.level);
      },
      setMode(m) {
        estado.current.view.mode = m;
      },
      burst: lanzarChispas,
      play(eventos, alTerminar) {
        const e = estado.current;
        const miRun = ++e.runId;
        const view = e.view;
        let i = 0;

        const siguiente = () => {
          if (miRun !== e.runId) return;
          if (i >= eventos.length) {
            view.mode = 'idle';
            view.p = 0;
            view.e = 0;
            alTerminar();
            return;
          }
          const ev = eventos[i++];
          const t0 = performance.now();
          const dur = DUR[ev.k];
          Object.assign(view, { fx: ev.fx, fy: ev.fy, tx: ev.tx, ty: ev.ty, dir: ev.d, lit: ev.lit, mode: MODOS[ev.k] });
          if (ev.k === 'walk') sfx('step');
          else if (ev.k === 'jump') sfx('jump');
          else if (ev.k === 'turn') sfx('turn');
          else if (ev.k === 'bump') sfx('bump');

          let campana = false;
          let paso2 = false;
          const cuadro = () => {
            if (miRun !== e.runId) return;
            const p = Math.min(1, (performance.now() - t0) / dur);
            const suave = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            view.p = p;
            view.e = suave;
            view.cx = ev.fx + (ev.tx - ev.fx) * suave;
            view.cy = ev.fy + (ev.ty - ev.fy) * suave;
            if (ev.k === 'turn' && p > 0.5) view.dir = ev.d2; // aquí cambia de frente a espalda
            if (ev.k === 'bulb') {
              const clave = ev.fx + ',' + ev.fy;
              if (ev.off) view.lit = p > 0.35 ? ev.lit : [...ev.lit, clave]; // se apaga a mitad del gesto
              else view.lit = p > 0.35 ? ev.lit : ev.lit.filter((c) => c !== clave);
              if (p > 0.35 && !campana) {
                campana = true;
                if (ev.off) {
                  sfx('remove');
                  lanzarChispas(['#94a3b8', '#cbd5e1'], 10);
                } else {
                  sfx('bulb');
                  lanzarChispas(['#fde047', '#f59e0b', '#fff7ad'], 26);
                }
              }
            }
            if (ev.k === 'walk' && p > 0.5 && !paso2) {
              paso2 = true;
              sfx('step');
            }
            if (p < 1) {
              requestAnimationFrame(cuadro);
            } else {
              view.cx = ev.tx;
              view.cy = ev.ty;
              if (ev.k === 'turn') view.dir = ev.d2;
              setTimeout(siguiente, 40);
            }
          };
          cuadro();
        };
        siguiente();
      },
    };
  }, []);

  return <canvas ref={canvasRef} className="board-canvas" width="640" height="420" />;
});

export default Board;
