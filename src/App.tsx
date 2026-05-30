import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    setLastCount(null)
  }, [])

  const decrement = useCallback(() => {
    clearUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }, [clearUndo])

  const increment = useCallback(() => {
    clearUndo()
    setCount((p) => p + 1)
  }, [clearUndo])

  const reset = useCallback(() => {
    const wasFocused = document.activeElement === resetRef.current
    setLastCount(count)
    setCount(0)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(clearUndo, 5000)
    if (wasFocused) setTimeout(() => resetRef.current?.focus(), 0)
  }, [count, clearUndo])

  const undo = useCallback(() => {
    if (lastCount !== null) {
      setCount(lastCount)
      clearUndo()
    }
  }, [lastCount, clearUndo])

  const countRef = useRef(count)
  const lastCountRef = useRef(lastCount)
  countRef.current = count
  lastCountRef.current = lastCount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'

      if (isUndo) {
        if (lastCountRef.current !== null) {
          undo()
          key = 'undo'
        }
      } else if (e.key === '+' || e.key === '=') {
        increment()
        key = 'inc'
      } else if (e.key === '-') {
        if (countRef.current > 0) {
          decrement()
          key = 'dec'
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (countRef.current > 0) {
          reset()
          key = 'reset'
        }
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, increment, decrement, reset])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    }
  }, [])

  const isUndoable = lastCount !== null

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button
          ref={decRef}
          className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`}
          onClick={decrement}
          disabled={count === 0}
          aria-label="Decrement count"
          aria-keyshortcuts="-"
          title={count === 0 ? "Already at zero" : "Decrement (-)"}
        >-</button>
        <button
          ref={incRef}
          className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`}
          onClick={increment}
          aria-label="Increment count"
          aria-keyshortcuts="+ ="
          title="Increment (+)"
        >+</button>
        <button
          ref={resetRef}
          className={`counter-button reset-button ${activeShortcut === 'reset' || activeShortcut === 'undo' ? 'active' : ''}`}
          onClick={isUndoable ? undo : reset}
          disabled={count === 0 && !isUndoable}
          aria-label={isUndoable ? "Undo reset" : "Reset count"}
          aria-keyshortcuts={isUndoable ? "Control+Z" : "r"}
          title={isUndoable ? "Undo (Ctrl+Z)" : (count === 0 ? "Already at zero" : "Reset (R)")}
        >
          {isUndoable ? 'Undo' : 'Reset'}
        </button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
        {isUndoable && <>, <strong>Ctrl+Z</strong> undo</>}
      </footer>
    </main>
  )
}

export default App
