import { useMemo } from 'react'
import { commandsFor } from '../engine/commands.js'
import { initAudio, sfx } from '../audio/audio.js'

const SEEN_KEY = 'cq_seen_py'

function readSeen() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
  } catch {
    return {}
  }
}

// Botones que escriben código en el editor. Solo aparecen los que ya corresponden al nivel;
// los que se desbloquean por primera vez brillan.
export default function CommandBar({ levelIndex, onInsert }) {
  const { groups, fresh } = useMemo(() => {
    const seen = readSeen()
    const groups = commandsFor(levelIndex)
    const fresh = new Set()
    groups.forEach((g) => g.commands.forEach((c) => { if (!seen[c.label]) { fresh.add(c.label); seen[c.label] = 1 } }))
    if (fresh.size) {
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
      } catch {
        /* sin almacenamiento */
      }
    }
    return { groups, fresh }
  }, [levelIndex])

  return (
    <div className="cmds">
      {groups.map((g) => (
        <div className="cg" key={g.name}>
          <b>{g.name}</b>
          <div>
            {g.commands.map((c) => (
              <button
                type="button"
                key={c.label}
                className={'cb' + (fresh.has(c.label) ? ' new' : '')}
                style={{ '--c': g.color }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { initAudio(); sfx.click(); onInsert(c.text, c.inline) }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
