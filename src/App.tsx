import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

  useEffect(() => { document.title = `Count: ${count} | Palette Counter` }, [count])
  useEffect(() => () => clearTimeout(undoTimerRef.current), [])

  const clearUndo = useCallback(() => { setShowUndo(false); clearTimeout(undoTimerRef.current) }, [])

  const decrement = () => {
    clearUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = count
    setCount(0)
    setShowUndo(true)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])

  const undoReset = useCallback(() => { setCount(lastCountRef.current); clearUndo() }, [clearUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z'
      if (isUndo && showUndo) { undoReset(); key = 'undo' }
      else if (e.key === '+' || e.key === '=') { setCount((p) => p + 1); clearUndo(); key = 'inc' }
      else if (e.key === '-') {
        setCount((p) => { if (p > 0) { clearUndo(); key = 'dec'; return p - 1 } return p })
      } else if (e.key.toLowerCase() === 'r') {
        setCount((p) => { if (p > 0) { key = 'reset'; return p } return p })
        if (count > 0) reset()
      }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, showUndo, isMac, reset, undoReset, clearUndo])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? 'Already at zero' : 'Decrement (-)'}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { setCount(p => p + 1); clearUndo() }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? 'Already at zero' : 'Reset (R)'}>Reset</button>
      </div>
      {showUndo && (
        <div className="undo-toast" role="status">
          Counter reset. <button onClick={undoReset} className="undo-button" aria-label="Undo reset" aria-keyshortcuts={isMac ? 'Meta+Z' : 'Control+Z'}>Undo</button>
        </div>
      )}
      <footer className="shortcut-guide">
        <kbd aria-hidden="true">+</kbd> inc, <kbd aria-hidden="true">-</kbd> dec, <kbd aria-hidden="true">R</kbd> reset, <kbd aria-hidden="true">{isMac ? '⌘' : 'Ctrl'}+Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
