import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
function App() {
  const [count, setCount] = useState(0); const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false); const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null); const resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0); const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef = useRef(count); const showUndoRef = useRef(showUndo)
  useEffect(() => { countRef.current = count; document.title = `Count: ${count} | Palette Counter` }, [count])
  useEffect(() => { showUndoRef.current = showUndo }, [showUndo])
  const dismissUndo = useCallback(() => { setShowUndo(false); if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null } }, [])
  const undoReset = useCallback(() => { setCount(lastCountRef.current); dismissUndo() }, [dismissUndo])
  const decrement = () => { dismissUndo(); const wasFocused = document.activeElement === decRef.current; setCount(p => { const n = Math.max(0, p - 1); if (n === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0); return n }) }
  const reset = useCallback(() => { dismissUndo(); lastCountRef.current = countRef.current; const wasFocused = document.activeElement === resetRef.current; setCount(0); setShowUndo(true); undoTimerRef.current = setTimeout(dismissUndo, 5000); if (wasFocused) setTimeout(() => incRef.current?.focus(), 0) }, [dismissUndo])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let k: string | null = null; const isUndo = (IS_MAC ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z'
      if (isUndo && showUndoRef.current) { undoReset(); k = 'undo' }
      else if (e.key === '+' || e.key === '=') { dismissUndo(); setCount(p => p + 1); k = 'inc' }
      else if (e.key === '-') { dismissUndo(); setCount(p => { if (p > 0) { k = 'dec'; return p - 1 } return p }) }
      else if (e.key.toLowerCase() === 'r' && countRef.current > 0) { reset(); k = 'reset' }
      if (k) { setActiveShortcut(k); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoReset, dismissUndo, reset])
  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => setCount(p => p + 1)} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <div style={{ minHeight: '60px' }}>{showUndo && <div className="undo-toast" aria-live="polite"><span>Count reset.</span><button onClick={undoReset} className="undo-button" aria-label="Undo reset" aria-keyshortcuts={IS_MAC ? 'Command+Z' : 'Control+Z'}>Undo?</button></div>}</div>
      <footer className="shortcut-guide">Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{IS_MAC ? '⌘' : 'Ctrl'}+Z</strong> undo</footer>
    </main>
  )
}

export default App
