import { BLOQUES, TEMATICAS } from '../game/levels.js';

// Filas de programa (Principal, F1, F2), paleta de bloques y botones de acción
export default function ProgramPanel({
  level, prog, activa, ocupado,
  onActiva, onAgregar, onSlot, onQuitar, onEjecutar, onReiniciar, onBorrar,
}) {
  const tem = TEMATICAS[level.t];

  return (
    <div className="card">
      <div id="info">
        <b>{tem.nombre}:</b> {tem.ayuda} Enciende las <b>{level.l.length}</b> 💡.
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
                  {def.icono}{b.t === 'REP' ? '×' + b.n : ''}
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
            {BLOQUES[k].icono}
            <small>{BLOQUES[k].nombre}</small>
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="go" onClick={onEjecutar} disabled={ocupado}>▶ Ejecutar</button>
        <button className="sec" onClick={onReiniciar}>↺ Reiniciar</button>
        <button className="sec" onClick={onBorrar}>🗑 Borrar</button>
      </div>
    </div>
  );
}
