import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const undoTimerRef = useRef<number | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
    setLastCount(null)
  }, [])

  const undo = useCallback(() => {
    if (lastCount !== null) {
      setCount(lastCount)
      clearUndo()
    }
  }, [lastCount, clearUndo])

  const increment = useCallback(() => {
    clearUndo()
    setCount((p) => p + 1)
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
    if (count === 0) return
    clearUndo()
    setLastCount(count)
    setCount(0)
    const wasFocused = document.activeElement === resetRef.current
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    undoTimerRef.current = window.setTimeout(() => {
      setLastCount(null)
      undoTimerRef.current = null
    }, 5000)
  }, [count, clearUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (e.ctrlKey || e.metaKey) && e.key === 'z'

      if (isUndo) {
        undo()
        key = 'undo'
      } else if (e.key === '+' || e.key === '=') {
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
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, undo, reset, increment, decrement])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    }
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? "Already at zero" : "Reset (R)"}>Reset</button>
      </div>
      {lastCount !== null && (
        <div className="undo-container">
          <button className={`undo-button ${activeShortcut === 'undo' ? 'active' : ''}`} onClick={undo} aria-label="Undo reset" aria-keyshortcuts="Control+Z Meta+Z">
            Undo Reset (5s)
          </button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{navigator.platform.includes('Mac') ? '⌘Z' : 'Ctrl+Z'}</strong> undo
      </footer>
    </main>
  )
}

export default App
