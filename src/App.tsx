import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [undoCount, setUndoCount] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    setUndoCount(null)
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  const increment = useCallback(() => {
    setCount((p) => p + 1)
    clearUndo()
  }, [clearUndo])

  const decrement = useCallback(() => {
    if (count > 0) {
      const wasFocused = document.activeElement === decRef.current
      const nextCount = count - 1
      setCount(nextCount)
      if (nextCount === 0 && wasFocused) {
        setTimeout(() => incRef.current?.focus(), 0)
      }
      clearUndo()
    }
  }, [count, clearUndo])

  const reset = useCallback(() => {
    if (count > 0) {
      const wasFocused = document.activeElement === resetRef.current
      setUndoCount(count)
      setCount(0)
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = window.setTimeout(clearUndo, 5000)
      if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    }
  }, [count, clearUndo])

  const undo = useCallback(() => {
    if (undoCount !== null) {
      setCount(undoCount)
      clearUndo()
    }
  }, [undoCount, clearUndo])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if (e.key === '+' || e.key === '=') {
        increment()
        key = 'inc'
      } else if (e.key === '-') {
        // decrement internally handles count > 0 check via setCount
        decrement()
        key = 'dec'
      } else if (e.key.toLowerCase() === 'r') {
        reset()
        key = 'reset'
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        undo()
        key = 'undo'
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [increment, decrement, reset, undo])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {undoCount !== null && (
        <div className="undo-container">
          <button
            className={`counter-button undo-button ${activeShortcut === 'undo' ? 'active' : ''}`}
            onClick={undo}
            aria-label={`Undo reset to ${undoCount}`}
            aria-keyshortcuts="Control+Z Meta+Z"
          >
            Undo Reset ({undoCount})
          </button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <kbd aria-label="plus">+</kbd> inc, <kbd aria-label="minus">-</kbd> dec, <kbd aria-label="r">R</kbd> reset, <kbd aria-label="control z">Ctrl+Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
