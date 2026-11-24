import { challengesOf } from '../engine/medals.js'
import { requirementText } from '../engine/levels.js'

export default function MissionBox({ level, mask }) {
  return (
    <div className="mission">
      <span className="mtag">Tu misión</span>
      <div className="mgoal">{level.goal}</div>
      <div className="muse">{requirementText(level)}</div>
      <div className="msug">💡 {level.tip}</div>
      <div className="chips">
        {challengesOf(level).map((c) => {
          const got = (mask & c.bit) !== 0
          return <span key={c.bit} className={'chip' + (got ? ' got' : '')}>{c.icon} {c.text}{got ? ' ✓' : ''}</span>
        })}
      </div>
    </div>
  )
}
