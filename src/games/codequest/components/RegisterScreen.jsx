import { useState } from 'react'
import { HEROES } from '../engine/heroes.js'
import { initAudio, sfx, startMusic } from '../audio/audio.js'
import { registerPlayer } from '../api/client.js'
import HeroSprite from './HeroSprite.jsx'

export default function RegisterScreen({ initial, onStart }) {
  const [username, setUsername] = useState(initial?.username || '')
  const [heroId, setHeroId] = useState(initial?.heroId || HEROES[0].id)
  const [busy, setBusy] = useState(false)
  const ok = username.trim().length >= 2

  async function submit(e) {
    e.preventDefault()
    if (!ok || busy) return
    initAudio()
    startMusic()
    sfx.click()
    setBusy(true)
    const base = { username: username.trim(), heroId }
    let session = { ...base, id: null }
    let online = false
    try {
      const r = await registerPlayer(base)
      session = { ...base, username: r.username || base.username, id: r.id }
      online = true
    } catch {
      /* sin servidor: se juega igual y se sincroniza después */
    }
    setBusy(false)
    onStart(session, online)
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Crea tu héroe</h2>
      <label className="field">
        <span>Nombre de usuario</span>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} placeholder="Ej: ShadowDiego" autoComplete="off" />
      </label>
      <div className="field"><span>Elige tu personaje</span></div>
      <div className="heroes">
        {HEROES.map((h) => (
          <button type="button" key={h.id} className={'hero' + (h.id === heroId ? ' sel' : '')} onClick={() => { initAudio(); sfx.click(); setHeroId(h.id) }}>
            <HeroSprite hero={h} />
            <b>{h.name}</b>
            <small>{h.role}</small>
          </button>
        ))}
      </div>
      <div className="row">
        <button className="go" type="submit" disabled={!ok || busy}>{busy ? 'Entrando…' : 'Comenzar aventura'}</button>
        <span className="cnt">{ok ? '' : 'Escribe un nombre de al menos 2 letras.'}</span>
      </div>
    </form>
  )
}
