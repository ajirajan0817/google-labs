import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0), [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { document.title = `Count: ${count} | Palette Counter` }, [count])
  const dismissUndo = useCallback(() => { setShowUndo(false); if (undoTimerRef.current) clearTimeout(undoTimerRef.current); undoTimerRef.current = null }, [])
  const undoReset = useCallback(() => { setCount(lastCountRef.current); dismissUndo() }, [dismissUndo])
  const increment = useCallback(() => { setCount((p) => p + 1); dismissUndo() }, [dismissUndo])
  const decrement = useCallback(() => {
    const focused = document.activeElement === decRef.current; dismissUndo()
    setCount((p) => { const n = Math.max(0, p - 1); if (n === 0 && focused) setTimeout(() => incRef.current?.focus(), 0); return n })
  }, [dismissUndo])
  const reset = useCallback(() => {
    const focused = document.activeElement === resetRef.current
    if (count > 0) {
      lastCountRef.current = count; setShowUndo(true)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current); undoTimerRef.current = setTimeout(dismissUndo, 5000)
    }
    setCount(0); if (focused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count, dismissUndo])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { if (showUndo) { undoReset(); e.preventDefault() } }
      else if (e.key === '+' || e.key === '=') { increment(); key = 'inc' }
      else if (e.key === '-') { if (count > 0) { decrement(); key = 'dec' } }
      else if (e.key.toLowerCase() === 'r') { if (count > 0) { reset(); key = 'reset' } }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showUndo, undoReset, increment, decrement, reset, count])
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {showUndo && <div className="undo-toast" aria-live="assertive">Action performed. <button className="undo-link" onClick={undoReset} aria-label="Undo reset">Undo?</button></div>}
      <footer className="shortcut-guide">Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{isMac ? '⌘Z' : 'Ctrl+Z'}</strong> undo</footer>
    </main>
  )
}

export default App
