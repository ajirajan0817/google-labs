import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0), [showUndo, setShowUndo] = useState(false), [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined), showUndoRef = useRef(false), countRef = useRef(0)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

  useEffect(() => { document.title = `Count: ${count} | Palette Counter`; countRef.current = count; showUndoRef.current = showUndo }, [count, showUndo])
  useEffect(() => () => clearTimeout(undoTimerRef.current), [])

  const undo = () => { setCount(lastCountRef.current); setShowUndo(false); clearTimeout(undoTimerRef.current) }
  const decrement = () => { setShowUndo(false); setCount((p) => {
    const next = Math.max(0, p - 1)
    if (next === 0 && document.activeElement === decRef.current) setTimeout(() => incRef.current?.focus(), 0)
    return next
  }) }
  const reset = () => {
    if (countRef.current === 0) return
    lastCountRef.current = countRef.current; setCount(0); setShowUndo(true)
    clearTimeout(undoTimerRef.current); undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (document.activeElement === resetRef.current) setTimeout(() => incRef.current?.focus(), 0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if (e.key === '+' || e.key === '=') { setCount((p) => p + 1); key = 'inc'; setShowUndo(false) }
      else if (e.key === '-') { setCount((p) => { if (p > 0) { key = 'dec'; setShowUndo(false); return p - 1 } return p }) }
      else if (e.key.toLowerCase() === 'r') { if (countRef.current > 0) { key = 'reset'; reset() } }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && showUndoRef.current) { e.preventDefault(); undo() }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      {showUndo && (
        <div className="undo-toast" role="status">
          Reset to 0. <button className="undo-button" onClick={undo} aria-label="Undo reset" aria-keyshortcuts={`${isMac ? 'Meta' : 'Control'}+Z`}>Undo</button>
          <small className="undo-hint">({isMac ? '⌘' : 'Ctrl'}+Z)</small>
        </div>
      )}
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { setCount((p) => p + 1); setShowUndo(false) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  )
}

export default App
