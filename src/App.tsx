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
    setLastCount(null)
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    }
  }, [])

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
    const wasFocused = document.activeElement === resetRef.current
    if (count > 0) {
      setLastCount(count)
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = window.setTimeout(() => {
        setLastCount(null)
        undoTimerRef.current = null
      }, 5000)
    }
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])

  const undo = useCallback(() => {
    if (lastCount !== null) {
      setCount(lastCount)
      clearUndo()
    }
  }, [lastCount, clearUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'

      if (isUndo) {
        undo()
        key = 'undo'
      } else if (e.key === '+' || e.key === '=') {
        clearUndo()
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        if (count > 0) {
          clearUndo()
          setCount((p) => p - 1)
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
  }, [count, lastCount, clearUndo, reset, undo])

  const platform = typeof navigator !== 'undefined' ? (navigator.userAgent.toLowerCase().includes('mac') ? 'Mac' : 'Win') : 'Win'

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { clearUndo(); setCount((p) => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? "Already at zero" : "Reset (R)"}>Reset</button>
      </div>
      {lastCount !== null && (
        <div className="undo-container">
          <button className={`counter-button undo-button ${activeShortcut === 'undo' ? 'active' : ''}`} onClick={undo} aria-label="Undo reset" aria-keyshortcuts="Control+Z or Command+Z">Undo Reset</button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{platform === 'Mac' ? '⌘' : 'Ctrl'}+Z</strong> undo
      </footer>
    </main>
  )
}

export default App
