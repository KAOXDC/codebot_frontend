import { LEVELS, WORLDS, LEVEL_COUNT } from '../engine/levels.js'
import { getHero } from '../engine/heroes.js'
import { medalEmojis } from '../engine/medals.js'
import { sfx } from '../audio/audio.js'
import { pendingCount } from '../api/client.js'
import { ISLAND_URLS } from '../render/assets.js'
import { themeOf } from '../render/themes.js'
import CertificadoBoton from '../../../shell/CertificadoBoton.jsx'

export default function MapScreen({ session, progress, muted, onToggleMute, onOpen, onLogout }) {
  const hero = getHero(session.heroId)
  const pending = pendingCount()
  const completos = LEVELS.every((l) => progress.isDone(l.index))
  return (
    <div className="card">
      <div className="top">
        <div>
          <b>{session.username} · {hero.name} el/la {hero.role}</b>
          <div className="cnt">{session.id && pending === 0 ? '☁️ Progreso guardado en el servidor' : '💾 Guardado en este dispositivo' + (pending ? ` · ${pending} pendiente(s) de enviar` : '')}</div>
        </div>
        <div className="row" style={{ margin: 0 }}>
          <span className="pill">🏅 {progress.totalMedals} / {LEVEL_COUNT * 3}</span>
          <span className="pill">⭐ {progress.totalPoints} pts</span>
          <button className="sec" onClick={onToggleMute}>{muted ? '🔇 Sin sonido' : '🔊 Sonido'}</button>
          <button className="sec" onClick={() => { sfx.click(); onLogout() }}>Cambiar héroe</button>
          <button className="sec" onClick={() => { sfx.click(); progress.toggleAllOpen() }}>{progress.allOpen ? '🔒 Bloquear niveles' : '🔓 Ver todos los niveles'}</button>
        </div>
      </div>
      {completos && (
        <div className="row" style={{ margin: '12px 0', justifyContent: 'center', gap: 12 }}>
          <b>🎉 ¡Completaste las {LEVEL_COUNT} misiones!</b>
          <CertificadoBoton
            className="sec"
            datos={{
              nombre: session.username,
              juego: 'CodeQuest',
              descripcion: `Aventura en Python con ${hero.name} el/la ${hero.role}: variables, condicionales, ciclos y funciones`,
              estadisticas: [
                { valor: progress.totalPoints, etiqueta: 'puntos' },
                { valor: `${progress.totalMedals} / ${LEVEL_COUNT * 3}`, etiqueta: 'medallas' },
                { valor: `${LEVEL_COUNT} / ${LEVEL_COUNT}`, etiqueta: 'niveles' },
              ],
            }}
          />
        </div>
      )}
      {WORLDS.map((name, wi) => {
        const th = themeOf(wi)
        return (
        <div key={name} style={{ '--wc': th.accent }}>
          <div className="worldhead" style={{ background: `linear-gradient(90deg, ${th.banner[0]}, ${th.banner[1]})`, borderColor: th.accent }}>
            <img src={ISLAND_URLS[wi]} alt="" width="64" height="64" />
            <div>
              <div className="world" style={{ margin: 0, color: th.accent }}>Mundo {wi + 1}: {name}</div>
              <small>{th.nombre}</small>
            </div>
          </div>
          <div className="map">
            {LEVELS.filter((l) => l.world === wi).map((l) => {
              const unlocked = progress.isUnlocked(l.index)
              const done = progress.isDone(l.index)
              return (
                <button key={l.index} className={'lv' + (done ? ' done' : '') + (unlocked ? '' : ' lock')} disabled={!unlocked} onClick={() => { sfx.click(); onOpen(l.index) }}>
                  <b>{l.number}</b>
                  <small>{l.title}</small>
                  {done && <small>{medalEmojis(progress.medalsOf(l.index))}</small>}
                </button>
              )
            })}
          </div>
        </div>
        )
      })}
    </div>
  )
}
