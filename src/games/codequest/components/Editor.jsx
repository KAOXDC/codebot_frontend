import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { colorize } from '../engine/highlight.js'
import { applySuggestion, cursorPos, indentSelection, newlineIndent, smartBackspace, suggestions, wordBefore } from '../engine/editing.js'

const PAD = 10
const LH = 14 * 1.45

// Editor de código: textarea transparente sobre un <pre> coloreado, con números de línea,
// autocompletar (flechas + Tab/Enter), sangría con Tab / Shift+Tab y sangría automática.
export default function Editor({ value, onChange, taRef, preRef, levelIndex = 0 }) {
  const html = useMemo(() => colorize(value) + '\n', [value])
  const lines = value.split('\n').length
  const digits = Math.max(2, String(lines).length)
  const gutRef = useRef(null)
  const measRef = useRef(null)
  const pending = useRef(null)
  const [cw, setCw] = useState(8.4)
  const [scroll, setScroll] = useState({ top: 0, left: 0 })
  const [pos, setPos] = useState({ line: 1, col: 1, i: 0 })
  const [focus, setFocus] = useState(false)
  const [menu, setMenu] = useState({ items: [], sel: 0, force: false, closed: false })

  useLayoutEffect(() => {
    const w = measRef.current?.getBoundingClientRect().width
    if (w) setCw(w / 10)
  }, [])

  // Tras aplicar un cambio, deja el cursor donde corresponde
  useLayoutEffect(() => {
    const ta = taRef.current
    if (pending.current && ta) {
      const { a, b } = pending.current
      pending.current = null
      ta.setSelectionRange(a, b)
      refresh(ta.value, a, menu.force)
    }
  })

  function refresh(v, i, force = false) {
    const p = cursorPos(v, i)
    setPos({ ...p, i })
    const { prefix } = wordBefore(v, i)
    const items = suggestions(prefix, levelIndex, v, force)
    setMenu((m) => ({ items, sel: Math.min(m.sel, Math.max(0, items.length - 1)), force, closed: false }))
  }

  function apply(r, force = false) {
    pending.current = { a: r.selStart, b: r.selEnd }
    setMenu((m) => ({ ...m, force }))
    onChange(r.value)
  }

  function accept(sug) {
    const ta = taRef.current
    apply(applySuggestion(ta.value, ta.selectionStart, sug))
    ta.focus()
  }

  const onKeyDown = (e) => {
    const ta = e.target
    const s = ta.selectionStart
    const en = ta.selectionEnd
    const open = menu.items.length > 0 && !menu.closed
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const n = menu.items.length
        setMenu((m) => ({ ...m, sel: (m.sel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n }))
        return
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        accept(menu.items[menu.sel])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setMenu((m) => ({ ...m, closed: true }))
        return
      }
    }
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault()
      refresh(ta.value, s, true)
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      apply(indentSelection(ta.value, s, en, e.shiftKey))
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault()
      apply(newlineIndent(ta.value, s, en))
    } else if (e.key === 'Backspace') {
      const r = smartBackspace(ta.value, s, en)
      if (r) {
        e.preventDefault()
        apply(r)
      }
    }
  }

  const sync = () => {
    const ta = taRef.current
    const pre = preRef.current
    if (!ta) return
    if (pre) {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
    }
    setScroll({ top: ta.scrollTop, left: ta.scrollLeft })
  }

  const tool = (outdent) => {
    const ta = taRef.current
    ta.focus()
    apply(indentSelection(ta.value, ta.selectionStart, ta.selectionEnd, outdent))
  }

  const gw = `${digits + 1.6}ch`
  const open = menu.items.length > 0 && !menu.closed && focus
  const left = Math.min(PAD + (pos.col - 1 - (wordBefore(value, pos.i).prefix.length)) * cw - scroll.left, 9999)
  const top = PAD + pos.line * LH - scroll.top + 2

  return (
    <div className="edbox" style={{ '--gw': gw }}>
      <div className="ed">
        <div className="gut" ref={gutRef} aria-hidden="true">
          <div style={{ transform: `translateY(${PAD - scroll.top}px)` }}>
            {Array.from({ length: lines }, (_, i) => (
              <div key={i} className={focus && pos.line === i + 1 ? 'on' : ''}>{i + 1}</div>
            ))}
          </div>
        </div>
        {focus && <div className="curline" style={{ top: PAD + (pos.line - 1) * LH - scroll.top, height: LH }} aria-hidden="true" />}
        <pre ref={preRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); refresh(e.target.value, e.target.selectionStart) }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => { if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) refresh(e.target.value, e.target.selectionStart, menu.force) }}
          onClick={(e) => refresh(e.target.value, e.target.selectionStart)}
          onFocus={(e) => { setFocus(true); refresh(e.target.value, e.target.selectionStart) }}
          onBlur={() => setFocus(false)}
          onScroll={sync}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
          aria-label="Editor de código Python"
          aria-autocomplete="list"
        />
        <span ref={measRef} className="meas" aria-hidden="true">0000000000</span>
      </div>
      {open && (
        <ul className="ac" role="listbox" style={{ left: `calc(var(--gw) + ${Math.max(0, left)}px)`, top }}>
          {menu.items.map((it, i) => (
            <li
              key={it.label}
              role="option"
              aria-selected={i === menu.sel}
              className={(i === menu.sel ? 'sel ' : '') + it.kind}
              onMouseDown={(e) => { e.preventDefault(); accept(it) }}
            >
              <b>{it.label}</b>
              <small>{it.d}</small>
            </li>
          ))}
          <li className="hintk" aria-hidden="true">Tab o Enter para aceptar · Esc para cerrar</li>
        </ul>
      )}
      <div className="edtools">
        <span className="pos">Ln {pos.line}, Col {pos.col}</span>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => tool(true)} title="Quitar sangría (Shift+Tab)">⇤ Quitar</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => tool(false)} title="Sangrar (Tab)">⇥ Sangrar</button>
      </div>
    </div>
  )
}
