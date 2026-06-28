import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [undoCount, setUndoCount] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    setUndoCount(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
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

  const handleResetAction = useCallback(() => {
    if (undoCount !== null) {
      setCount(undoCount)
      clearUndo()
      return
    }

    const wasFocused = document.activeElement === resetRef.current
    setUndoCount(count)
    setCount(0)
    if (wasFocused && count === 0) setTimeout(() => incRef.current?.focus(), 0)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setUndoCount(null)
      if (document.activeElement === resetRef.current) incRef.current?.focus()
      timerRef.current = null
    }, 5000)
  }, [clearUndo, count, undoCount])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if (e.key === '+' || e.key === '=') {
        increment()
        key = 'inc'
      } else if (e.key === '-') {
        if (count > 0) {
          decrement()
          key = 'dec'
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (count > 0 || undoCount !== null) {
          handleResetAction()
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
  }, [count, undoCount, increment, decrement, handleResetAction])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''} ${undoCount !== null ? 'undo-state' : ''}`} onClick={handleResetAction} disabled={count === 0 && undoCount === null} aria-label={undoCount !== null ? "Undo reset" : "Reset count"} aria-keyshortcuts="r" title={undoCount !== null ? "Undo Reset (R)" : (count === 0 ? "Already at zero" : "Reset (R)")}>{undoCount !== null ? "Undo" : "Reset"}</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong>/<strong>=</strong> inc, <strong>-</strong> dec, <strong>R</strong> {undoCount !== null ? "undo" : "reset"}
      </footer>
    </main>
  )
}

export default App
