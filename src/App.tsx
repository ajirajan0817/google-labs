import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const countRef = useRef(count); countRef.current = count
  const showUndoRef = useRef(showUndo); showUndoRef.current = showUndo
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { document.title = `Count: ${count} | Palette Counter` }, [count])

  const clearUndo = () => { setShowUndo(false); clearTimeout(undoTimerRef.current) }
  const undo = () => { setCount(lastCountRef.current); clearUndo() }

  const decrement = () => {
    clearUndo(); const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = () => {
    if (countRef.current === 0) return
    clearUndo(); lastCountRef.current = countRef.current; setCount(0); setShowUndo(true)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (document.activeElement === resetRef.current) setTimeout(() => incRef.current?.focus(), 0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && showUndoRef.current) { undo(); return }
      if (e.key === '+' || e.key === '=') { setCount((p) => { clearUndo(); return p + 1 }); key = 'inc' }
      else if (e.key === '-') { setCount((p) => { if (p > 0) { clearUndo(); key = 'dec'; return p - 1 } return p }) }
      else if (e.key.toLowerCase() === 'r') { reset(); key = 'reset' }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown); clearTimeout(undoTimerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { clearUndo(); setCount((p) => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? "Already at zero" : "Reset (R)"}>Reset</button>
      </div>
      {showUndo && <div className="undo-toast" aria-live="assertive">Action performed. <button className="undo-button" onClick={undo} aria-label="Undo reset">Undo?</button></div>}
      <footer className="shortcut-guide">
        Shortcuts: <kbd>+</kbd> inc, <kbd>-</kbd> dec, <kbd>R</kbd> reset, <kbd>{/Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}+Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
