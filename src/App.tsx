import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [showUndo, setShowUndo] = useState(false)
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { document.title = `Count: ${count} | Palette Counter` }, [count])
  const clearUndo = () => { setShowUndo(false); clearTimeout(undoTimerRef.current) }

  const decrement = () => {
    clearUndo()
    setCount(prev => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && document.activeElement === decRef.current) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = () => {
    if (count === 0) return
    lastCountRef.current = count; setShowUndo(true); setCount(0)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (document.activeElement === resetRef.current) setTimeout(() => incRef.current?.focus(), 0)
  }

  const undo = () => { if (showUndo) { setCount(lastCountRef.current); clearUndo() } }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { if (showUndo) undo() }
      else if (e.key === '+' || e.key === '=') { setCount(p => p + 1); clearUndo() }
      else if (e.key === '-') decrement()
      else if (e.key.toLowerCase() === 'r') reset()
    }
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, showUndo])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className="counter-button" onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className="counter-button" onClick={() => { setCount(p => p + 1); clearUndo() }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className="counter-button reset-button" onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
        {showUndo && <button className="counter-button undo-button" onClick={undo} aria-label="Undo reset" aria-keyshortcuts="Control+Z">Undo</button>}
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <kbd title="Plus or Equals">+</kbd> inc, <kbd title="Minus">-</kbd> dec, <kbd title="R key">R</kbd> reset, {showUndo && <><kbd title="Undo shortcut">{/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}+Z</kbd> undo</>}
      </footer>
    </main>
  )
}

export default App
