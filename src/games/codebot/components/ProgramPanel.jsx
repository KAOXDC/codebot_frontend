import { BLOQUES, TEMATICAS } from '../game/levels.js';
import { ICONO_BLOQUE, ICONO_ACCION } from '../game/icons.js';

const Bi = ({ k }) => <img className="bi" src={ICONO_BLOQUE[k]} alt="" draggable="false" />;
const Ai = ({ k }) => <span className="ai" style={{ '--m': `url(${ICONO_ACCION[k]})` }} aria-hidden="true" />;

// Filas de programa (Principal, F1, F2), paleta de bloques y botones de acción
export default function ProgramPanel({
  level, prog, activa, ocupado,
  onActiva, onAgregar, onSlot, onQuitar, onEjecutar, onReiniciar, onBorrar,
}) {
  const tem = TEMATICAS[level.t];

  return (
    <div className="card">
      <div id="info">
        <b>{tem.nombre}:</b> {tem.ayuda} Enciende las <b>{level.l.length}</b> {level.l.length === 1 ? "bombilla" : "bombillas"} <img className="bi inl" src={ICONO_BLOQUE.B} alt="" style={{ background: BLOQUES.B.color }} />. <small>Si la pulsas dos veces, se apaga.</small>
      </div>

      {['main', 'f1', 'f2'].map((k) => {
        const lim = k === 'main' ? level.m : level[k];
        if (!lim) return null;
        return (
          <div key={k} className={'row' + (activa === k ? ' act' : '')} onClick={() => onActiva(k)}>
            <b>{k === 'main' ? 'Principal' : k.toUpperCase()}</b>
            {Array.from({ length: lim }, (_, i) => {
              const b = prog[k][i];
              if (!b) return <div key={i} className="slot" />;
              const def = BLOQUES[b.t];
              return (
                <div
                  key={i}
                  className="slot f"
                  style={{ background: def.color }}
                  onClick={(e) => { e.stopPropagation(); onSlot(k, i); }}
                >
                  <Bi k={b.t} />{b.t === 'REP' && <em className="rn">×{b.n}</em>}
                  <i onClick={(e) => { e.stopPropagation(); onQuitar(k, i); }}>×</i>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="lbl" style={{ marginTop: 4 }}>Bloques</div>
      <div id="pal">
        {level.a.map((k) => (
          <button key={k} className="pb" style={{ background: BLOQUES[k].color }} onClick={() => onAgregar(k)}>
            <Bi k={k} />
            <small>{BLOQUES[k].nombre}</small>
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="go" onClick={onEjecutar} disabled={ocupado}><Ai k="ejecutar" />Ejecutar</button>
        <button className="sec" onClick={onReiniciar}><Ai k="reiniciar" />Reiniciar</button>
        <button className="sec" onClick={onBorrar}><Ai k="borrar" />Borrar</button>
      </div>
    </div>
  );
}
