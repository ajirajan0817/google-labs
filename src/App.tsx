import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const [showUndo, setShowUndo] = useState(false)
  const lastCountRef = useRef<number | null>(null)
  const undoTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    }
  }, [])

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    setShowUndo(false)
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  const undo = useCallback(() => {
    if (lastCountRef.current !== null) {
      setCount(lastCountRef.current)
      clearUndo()
    }
  }, [clearUndo])

  const decrement = useCallback(() => {
    clearUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }, [clearUndo])

  const reset = useCallback(() => {
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = count
    setCount(0)
    setShowUndo(true)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)

    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(() => {
      setShowUndo(false)
      undoTimerRef.current = null
    }, 5000)
  }, [count])

  const increment = useCallback(() => {
    clearUndo()
    setCount((p) => p + 1)
  }, [clearUndo])

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
        if (count > 0) {
          reset()
          key = 'reset'
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (showUndo) {
          e.preventDefault()
          undo()
        }
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, showUndo, clearUndo, decrement, reset, undo, increment])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? "Already at zero" : "Reset (R)"}>Reset</button>
        {showUndo && (
          <button className="counter-button undo-button" onClick={undo} aria-label="Undo reset" aria-keyshortcuts="Ctrl+Z" title="Undo (Ctrl+Z)">Undo</button>
        )}
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <kbd>Ctrl+Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
