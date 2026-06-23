import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0); const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false); const lastCountRef = useRef(0)
  const incRef = useRef<HTMLButtonElement>(null); const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null); const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const showUndoRef = useRef(false); const countRef = useRef(0)

  useEffect(() => {
    showUndoRef.current = showUndo; countRef.current = count
    document.title = `Count: ${count} | Palette Counter`
  }, [count, showUndo])

  const clearUndo = useCallback(() => { setShowUndo(false); clearTimeout(undoTimerRef.current) }, [])
  const undoReset = useCallback(() => { setCount(lastCountRef.current); clearUndo() }, [clearUndo])
  const increment = useCallback(() => { clearUndo(); setCount(p => p + 1) }, [clearUndo])
  const decrement = useCallback(() => {
    clearUndo(); const wasFocused = document.activeElement === decRef.current
    setCount(prev => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0); return next
    })
  }, [clearUndo])
  const reset = useCallback(() => {
    if (countRef.current === 0) return; const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = countRef.current; setCount(0); setShowUndo(true)
    clearTimeout(undoTimerRef.current); undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null; const isMod = e.ctrlKey || e.metaKey
      if (e.key.toLowerCase() === 'z' && isMod && showUndoRef.current) return undoReset()
      if (e.key === '+' || e.key === '=') { increment(); key = 'inc' }
      else if (e.key === '-' && countRef.current > 0) { decrement(); key = 'dec' }
      else if (e.key.toLowerCase() === 'r' && countRef.current > 0) { reset(); key = 'reset' }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [increment, decrement, reset, undoReset])

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      {showUndo && <div className="undo-toast" aria-live="assertive">Reset. <button className="undo-button" onClick={undoReset} aria-label="Undo reset" aria-keyshortcuts="Control+Z Meta+Z">Undo</button> <span className="undo-hint">({isMac ? '⌘Z' : 'Ctrl+Z'})</span></div>}
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide">Shortcuts: <kbd>+</kbd> inc, <kbd>-</kbd> dec, <kbd>R</kbd> reset</footer>
    </main>
  )
}

export default App
