import { LEVELS, WORLDS, LEVEL_COUNT } from '../engine/levels.js'
import { getHero } from '../engine/heroes.js'
import { medalEmojis } from '../engine/medals.js'
import { sfx } from '../audio/audio.js'
import { pendingCount } from '../api/client.js'

export default function MapScreen({ session, progress, muted, onToggleMute, onOpen, onLogout }) {
  const hero = getHero(session.heroId)
  const pending = pendingCount()
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
      {WORLDS.map((name, wi) => (
        <div key={name}>
          <div className="world">Mundo {wi + 1}: {name}</div>
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
      ))}
    </div>
  )
}
