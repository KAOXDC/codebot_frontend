import { useState } from 'react'
import { challengesOf } from '../engine/medals.js'
import { requirementText } from '../engine/levels.js'
import Acordeon from './Acordeon.jsx'

export default function MissionBox({ level, mask }) {
  const [tip, setTip] = useState(false)
  return (
    <div className="mission">
      <span className="mtag">Tu misión</span>
      <div className="mgoal">{level.goal}</div>
      <div className="muse">{requirementText(level)}</div>
      <Acordeon className="tipacc" titulo="💡 Consejo del nivel" abierto={tip} onToggle={() => setTip((v) => !v)}>
        <div className="msug">{level.tip}</div>
      </Acordeon>
      <div className="chips">
        {challengesOf(level).map((c) => {
          const got = (mask & c.bit) !== 0
          return <span key={c.bit} className={'chip' + (got ? ' got' : '')}>{c.icon} {c.text}{got ? ' ✓' : ''}</span>
        })}
      </div>
    </div>
  )
}
