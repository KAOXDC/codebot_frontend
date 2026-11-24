import { useMemo } from 'react'
import { colorize } from '../engine/highlight.js'

// Editor de código: un textarea transparente encima de un <pre> con el código coloreado.
export default function Editor({ value, onChange, taRef, preRef }) {
  const html = useMemo(() => colorize(value) + '\n', [value])

  const sync = () => {
    const ta = taRef.current
    const pre = preRef.current
    if (ta && pre) {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
    }
  }

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta = e.target
    ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end')
    onChange(ta.value)
  }

  return (
    <div className="ed">
      <pre ref={preRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={sync}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label="Editor de código Python"
      />
    </div>
  )
}
