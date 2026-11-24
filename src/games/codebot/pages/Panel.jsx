import { useState } from 'react';
import { api } from '../api.js';
import { fmt } from '../utils.js';

const MOTIVOS = [
  { id: 'faltan_bombillas', texto: 'Faltaron bombillas', color: '#f59e0b' },
  { id: 'sin_bombilla', texto: 'Encendió donde no había', color: '#ef4444' },
  { id: 'bucle_infinito', texto: 'Bucle infinito', color: '#8b5cf6' },
];

const num = (v, sufijo = '') => (v == null ? '—' : v + sufijo);

function Tarjeta({ valor, texto }) {
  return (
    <div className="kpi">
      <div className="kpi-v">{valor}</div>
      <div className="kpi-t">{texto}</div>
    </div>
  );
}

function BarraFallos({ fallos }) {
  const total = MOTIVOS.reduce((a, m) => a + fallos[m.id], 0);
  if (!total) return <span className="note">—</span>;
  return (
    <div className="bar" title={MOTIVOS.map((m) => `${m.texto}: ${fallos[m.id]}`).join('\n')}>
      {MOTIVOS.map((m) =>
        fallos[m.id] ? (
          <span key={m.id} style={{ width: `${(fallos[m.id] / total) * 100}%`, background: m.color }}>
            {fallos[m.id]}
          </span>
        ) : null
      )}
    </div>
  );
}

// Panel del profesor: se abre en  /#/panel
export default function Panel() {
  const [clave, setClave] = useState(sessionStorage.getItem('codebot_clave') || '');
  const [grupo, setGrupo] = useState('');
  const [sesion, setSesion] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = async (g = grupo, s = sesion) => {
    setCargando(true);
    setError('');
    try {
      const d = await api.estadisticas(clave, { grupo: g, sesion: s });
      sessionStorage.setItem('codebot_clave', clave);
      setDatos(d);
    } catch (e) {
      setDatos(null);
      setError(e.message === 'Failed to fetch' ? 'No se pudo conectar con el servidor' : e.message);
    } finally {
      setCargando(false);
    }
  };

  const descargar = async () => {
    try {
      const blob = await api.descargarCSV(clave, { grupo, sesion });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codebot-resultados.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  const r = datos?.resumen;

  return (
    <div className="wrap">
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="brand">
          <span className="logo">📊</span>
          <h1>Panel del profesor</h1>
        </div>
        <div className="filtros">
          <input type="password" placeholder="Clave del profesor" value={clave} onChange={(e) => setClave(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && cargar()} />
          <select value={grupo} onChange={(e) => { setGrupo(e.target.value); datos && cargar(e.target.value, sesion); }}>
            <option value="">Todos los grupos</option>
            {datos?.filtros.grupos.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={sesion} onChange={(e) => { setSesion(e.target.value); datos && cargar(grupo, e.target.value); }}>
            <option value="">Todas las sesiones</option>
            {datos?.filtros.sesiones.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="go" onClick={() => cargar()} disabled={cargando || !clave}>{cargando ? 'Cargando…' : datos ? 'Actualizar' : 'Ver estadísticas'}</button>
          <button className="sec" onClick={descargar} disabled={!datos}>⬇ Descargar CSV</button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {datos && (
        <>
          <div className="kpis">
            <Tarjeta valor={r.jugadores} texto="jugadores" />
            <Tarjeta valor={r.partidas} texto="partidas" />
            <Tarjeta valor={r.completadas} texto="terminaron los 12 niveles" />
            <Tarjeta valor={fmt(r.tiempoMedioMs)} texto="tiempo medio (completas)" />
            <Tarjeta valor={num(r.puntosMedios)} texto="puntos medios (completas)" />
          </div>

          <div className="card" style={{ marginBottom: 14, overflowX: 'auto' }}>
            <h2>Por nivel</h2>
            <p className="note">Los promedios solo cuentan a quienes completaron el nivel. «Se quedaron aquí» son partidas sin terminar cuyo último nivel superado es el anterior.</p>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nivel</th><th>Temática</th><th>Intentaron</th><th>Completaron</th><th>% éxito</th>
                  <th>Tiempo prom.</th><th>Intentos prom.</th><th>Bloques prom.</th><th>Puntos prom.</th>
                  <th>Fallos</th><th>Se quedaron aquí</th>
                </tr>
              </thead>
              <tbody>
                {datos.porNivel.map((n) => (
                  <tr key={n.nivel}>
                    <td><b>{n.nivel}</b></td>
                    <td>{n.tematica}</td>
                    <td>{n.intentaron}</td>
                    <td>{n.completaron}</td>
                    <td>{num(n.tasaExito, '%')}</td>
                    <td>{fmt(n.tiempoMedioMs)}</td>
                    <td>{num(n.intentosMedios)}</td>
                    <td>{num(n.bloquesMedios)}</td>
                    <td>{num(n.puntosMedios)}</td>
                    <td style={{ minWidth: 130 }}><BarraFallos fallos={n.fallos} /></td>
                    <td>{n.seQuedaronAqui}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="leyenda">
              {MOTIVOS.map((m) => (
                <span key={m.id}><i style={{ background: m.color }} />{m.texto}</span>
              ))}
            </div>
          </div>

          <div className="dos-col">
            <div className="card" style={{ overflowX: 'auto' }}>
              <h2>Por temática</h2>
              <table className="tbl">
                <thead>
                  <tr><th>Temática</th><th>% éxito</th><th>Tiempo prom.</th><th>Intentos prom.</th><th>Puntos prom.</th></tr>
                </thead>
                <tbody>
                  {datos.porTematica.map((t) => (
                    <tr key={t.tematica}>
                      <td><b>{t.tematica}</b></td>
                      <td>{num(t.tasaExito, '%')}</td>
                      <td>{fmt(t.tiempoMedioMs)}</td>
                      <td>{num(t.intentosMedios)}</td>
                      <td>{num(t.puntosMedios)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
              <h2>Estrategias en las soluciones</h2>
              <p className="note">% de soluciones que usaron cada recurso.</p>
              <table className="tbl">
                <thead>
                  <tr><th>Nivel</th><th>Resueltos</th><th>Funciones</th><th>Bucles</th><th>Condicionales</th></tr>
                </thead>
                <tbody>
                  {datos.estrategias.map((e) => (
                    <tr key={e.nivel}>
                      <td><b>{e.nivel}</b></td>
                      <td>{e.resueltos}</td>
                      <td>{e.resueltos ? e.funciones + '%' : '—'}</td>
                      <td>{e.resueltos ? e.bucles + '%' : '—'}</td>
                      <td>{e.resueltos ? e.condicionales + '%' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
