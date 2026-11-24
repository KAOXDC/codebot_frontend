import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { initState, runCode, isSolved, friendlyError } from '../engine/simulate.js'
import { medalMask, medalEmojis, countLines, stripComments, usesRequiredStructure, missingStructureText } from '../engine/medals.js'
import { computePoints } from '../engine/scoring.js'
import { toJavaScriptView } from '../engine/translate.js'
import { insertCommand } from '../engine/commands.js'
import { createBoard } from '../render/board.js'
import { initAudio, sfx, startMusic } from '../audio/audio.js'
import MissionBox from './MissionBox.jsx'
import Editor from './Editor.jsx'
import CommandBar from './CommandBar.jsx'
import Acordeon from './Acordeon.jsx'

// Código JavaScript con números de línea; se actualiza mientras el estudiante escribe
function JsView({ code }) {
  const lines = toJavaScriptView(code).split('\n')
  return (
    <div className="jsv" tabIndex={0} aria-label="Código JavaScript equivalente">
      {lines.map((ln, i) => (
        <div key={i}><span>{i + 1}</span><code>{ln || ' '}</code></div>
      ))}
    </div>
  )
}

const FIRST_MESSAGE = { text: 'Escribe tu código y pulsa Ejecutar.', kind: '' }

// Pantalla de un nivel. `report(payload)` se llama una vez por cada ejecución (también las que fallan).
export default function PlayScreen({ level, heroId, initialMask, hasNext, onBack, onNext, report }) {
  const [code, setCode] = useState(level.code)
  const [message, setMessage] = useState(FIRST_MESSAGE)
  const [running, setRunning] = useState(false)
  const [mask, setMask] = useState(initialMask)
  const [won, setWon] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [verPista, setVerPista] = useState(false)
  const [verJs, setVerJs] = useState(false)

  const canvasRef = useRef(null)
  const taRef = useRef(null)
  const preRef = useRef(null)
  const boardRef = useRef(null)
  const stateRef = useRef(null)
  const playRef = useRef(null)
  const attemptRef = useRef(0)
  const openedRef = useRef(Date.now())
  const cursorRef = useRef(null)

  // Bucle de animación: dibuja el tablero y, si hay una ejecución en curso, avanza un frame cada cierto tiempo.
  useEffect(() => {
    const board = createBoard(canvasRef.current, level.index)
    boardRef.current = board
    stateRef.current = initState(level)
    playRef.current = null
    let raf

    const finish = (r) => {
      setRunning(false)
      if (r.solved && r.mask) {
        setMask((m) => m | r.mask)
        setWon(true)
        const missing = []
        if (!(r.mask & 2)) missing.push(`🥈 usa ${level.lines} líneas o menos`)
        if (!(r.mask & 4)) missing.push(`🥇 hazlo en ${level.opt} pasos`)
        setMessage({
          kind: 'ok',
          text:
            `¡Nivel superado! ${medalEmojis(r.mask)}  +${r.points} puntos\n` +
            `Pasos del héroe: ${r.steps} (mejor posible: ${level.opt}) · Líneas: ${r.lines} (meta: ${level.lines})` +
            (missing.length ? `\nTe falta: ${missing.join(' · ')}` : '\n¡Todas las medallas!'),
        })
        sfx.win()
      } else if (r.solved) {
        setMessage({ kind: 'bad', text: `Llegaste a la meta, pero este nivel pide usar: ${missingStructureText(level)}. Escríbelo con esa estructura para ganar medallas y pasar al siguiente nivel.` })
        sfx.fail()
      } else {
        setMessage({ kind: 'bad', text: `Todavía no lo logras. ${r.gemsLeft ? 'Quedan gemas. ' : ''}${r.enemiesLeft ? 'Quedan enemigos. ' : ''}Ajusta tu código.` })
        sfx.fail()
      }
    }

    const loop = (t) => {
      const pb = playRef.current
      if (pb && t - pb.last > pb.wait) {
        pb.last = t
        if (pb.i >= pb.frames.length) {
          playRef.current = null
          finish(pb.result)
        } else {
          const f = pb.frames[pb.i++]
          pb.wait = f.event === 'attack' || f.event === 'miss' ? 650 : 230
          stateRef.current = { ...stateRef.current, gems: f.gems, enemies: f.enemies, x: f.x, y: f.y, face: f.face }
          if (f.event === 'step') sfx.step()
          else if (f.event === 'bump') sfx.bump()
          else if (f.event === 'gem') {
            sfx.step()
            sfx.gem()
          } else if (f.event === 'attack' || f.event === 'miss') {
            sfx.attack()
            board.attack(f, t, heroId)
            if (f.hits && f.hits.length) sfx.hit()
          }
        }
      }
      board.draw(stateRef.current, t, heroId)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [level, heroId, resetKey])

  // Después de insertar un comando, devuelve el foco y el cursor al editor
  useLayoutEffect(() => {
    if (cursorRef.current != null && taRef.current) {
      const c = cursorRef.current
      cursorRef.current = null
      taRef.current.focus()
      taRef.current.setSelectionRange(c, c)
    }
  }, [code])

  const chars = stripComments(code).length

  function run() {
    initAudio()
    startMusic()
    if (playRef.current) return
    attemptRef.current += 1
    const base = {
      level: level.number,
      hero: heroId,
      attemptNumber: attemptRef.current,
      timeMs: Date.now() - openedRef.current,
      code,
      chars,
      lines: countLines(code),
    }
    if (level.max && chars > level.max) {
      setMessage({ kind: 'bad', text: `Superaste el máximo de ${level.max} caracteres. ¡Usa un ciclo o una función!` })
      sfx.fail()
      report({ ...base, status: 'too_long', reachedGoal: false, structureOk: false, medals: 0, steps: 0, points: 0 })
      return
    }
    try {
      const { frames } = runCode(code, level)
      const solved = isSolved(frames, level)
      const structureOk = usesRequiredStructure(level, code)
      const medals = solved ? medalMask(level, code, frames.length) : 0
      const points = computePoints(medals, attemptRef.current)
      report({ ...base, status: solved ? (structureOk ? 'completed' : 'no_structure') : 'incomplete', reachedGoal: solved, structureOk, medals, steps: frames.length, points })
      const last = frames[frames.length - 1]
      stateRef.current = initState(level)
      boardRef.current.clearEffects()
      setMessage({ kind: '', text: 'Ejecutando...' })
      setRunning(true)
      playRef.current = {
        frames, i: 0, last: 0, wait: 0,
        result: { solved, mask: medals, points, steps: frames.length, lines: base.lines, gemsLeft: last ? last.gems.size : 0, enemiesLeft: last ? last.enemies.size : 0 },
      }
    } catch (e) {
      const text = friendlyError(e)
      setMessage({ kind: 'bad', text: 'Error: ' + text })
      sfx.fail()
      report({ ...base, status: 'error', reachedGoal: false, structureOk: false, medals: 0, steps: 0, points: 0, errorMessage: text })
    }
  }

  function toggleFullscreen() {
    sfx.click()
    try {
      if (document.fullscreenElement) document.exitFullscreen()
      else document.documentElement.requestFullscreen()
    } catch {
      /* el navegador no lo permite */
    }
  }

  function reset() {
    sfx.click()
    playRef.current = null
    attemptRef.current = 0
    openedRef.current = Date.now()
    setRunning(false)
    setWon(false)
    setCode(level.code)
    setMessage(FIRST_MESSAGE)
    setResetKey((k) => k + 1)
  }

  function insert(text, inline) {
    const ta = taRef.current
    const r = insertCommand(code, ta.selectionStart, ta.selectionEnd, text, inline)
    cursorRef.current = r.cursor
    setCode(r.value)
  }

  return (
    <section className="play">
      <div className="top">
        <button className="sec" onClick={() => { sfx.click(); onBack() }}>← Mapa</button>
        <span className="pill">Nivel {level.number}: {level.title}</span>
        <button className="sec" onClick={toggleFullscreen}>⛶ Pantalla completa</button>
      </div>
      <MissionBox level={level} mask={mask} />
      <div className="grid2">
        <div className="card boardcol"><canvas ref={canvasRef} className="board" width={320} height={320} /></div>
        <div className="card codecol">
          <Editor value={code} onChange={setCode} taRef={taRef} preRef={preRef} levelIndex={level.index} />
          <div className="cnt legend">
            <span className="kw">if · for · while · def</span> · <span className="cmd">comandos</span> · <span className="fn">funciones</span> · <span className="co">True / False</span> · <span className="st">textos</span> · <span className="nu">números</span> · <span className="cm"># comentarios</span>
          </div>
          {level.max ? <div className="cnt" style={{ color: chars > level.max ? '#f87171' : undefined }}>Caracteres: {chars} / {level.max}</div> : null}
          <div className="row">
            <button className="go" onClick={run} disabled={running}>▶ Ejecutar</button>
            <button className="sec" onClick={reset}>Reiniciar</button>
            <button className="sec" aria-pressed={verPista} onClick={() => { sfx.click(); setVerPista((v) => !v) }}>💡 Pista</button>
            <button className="sec" aria-pressed={verJs} onClick={() => { sfx.click(); setVerJs((v) => !v) }}>Ver en JavaScript</button>
            {won && hasNext && <button className="go" onClick={() => { sfx.click(); onNext() }}>Siguiente →</button>}
          </div>
          <div className={'msg ' + message.kind} role="status">{message.text}</div>
          <Acordeon titulo="💡 Pista" abierto={verPista} onToggle={() => setVerPista((v) => !v)}>
            <div className="hintbox">{level.hint}</div>
          </Acordeon>
          <Acordeon titulo="Equivalente en JavaScript" abierto={verJs} onToggle={() => setVerJs((v) => !v)}>
            {verJs && <JsView code={code} />}
          </Acordeon>
          <CommandBar levelIndex={level.index} onInsert={insert} />
        </div>
      </div>
    </section>
  )
}
