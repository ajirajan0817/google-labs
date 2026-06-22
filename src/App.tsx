import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0), [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  useEffect(() => () => clearTimeout(undoTimerRef.current), [])

  const clearUndo = () => { setShowUndo(false); clearTimeout(undoTimerRef.current); }
  const increment = () => { clearUndo(); setCount(p => p + 1); }
  const decrement = () => {
    clearUndo(); const wasFocused = document.activeElement === decRef.current
    setCount(p => {
      const n = Math.max(0, p - 1); if (n === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return n
    })
  }
  const reset = () => {
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = countRef.current; setShowUndo(true); clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => { setShowUndo(false); undoTimerRef.current = undefined; }, 5000);
    setCount(0); if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }
  const undo = () => { setCount(lastCountRef.current); clearUndo(); }
  const countRef = useRef(count), showUndoRef = useRef(showUndo), h = useRef({ increment, decrement, reset, undo })
  useEffect(() => { countRef.current = count; showUndoRef.current = showUndo; h.current = { increment, decrement, reset, undo } })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z', isMod = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? e.metaKey : e.ctrlKey
      if (isZ && isMod && showUndoRef.current) { h.current.undo(); return }
      let key: string | null = null
      if (e.key === '+' || e.key === '=') { h.current.increment(); key = 'inc' }
      else if (e.key === '-' && countRef.current > 0) { h.current.decrement(); key = 'dec' }
      else if (e.key.toLowerCase() === 'r' && countRef.current > 0) { h.current.reset(); key = 'reset' }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {showUndo && (
        <div className="undo-toast" aria-live="assertive">
          Counter reset. <button className="undo-button" onClick={undo} aria-label="Undo reset">Undo</button>
          <span className="undo-hint"> (or <kbd>{/Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}+Z</kbd>)</span>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  )
}

export default App
