import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  const decrement = () => {
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setLastCount(count)
    setCount(0)
    undoTimerRef.current = setTimeout(() => setLastCount(null), 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])

  const undoReset = useCallback(() => {
    if (lastCount !== null) {
      setCount(lastCount)
      setLastCount(null)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [lastCount])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if (e.key === '+' || e.key === '=') {
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        setCount((p) => {
          if (p > 0) {
            key = 'dec'
            return p - 1
          }
          return p
        })
      } else if (e.key.toLowerCase() === 'r') {
        if (count > 0) {
          reset()
          key = 'reset'
        }
      } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
        if (lastCount !== null) {
          undoReset()
          key = 'undo'
        }
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, lastCount, reset, undoReset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => setCount((p) => p + 1)} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? "Nothing to reset" : "Reset (R)"}>Reset</button>
        {lastCount !== null && (
          <button className={`counter-button undo-button ${activeShortcut === 'undo' ? 'active' : ''}`} onClick={undoReset} aria-label="Undo reset" aria-keyshortcuts="Control+Z" title="Undo Reset (Ctrl+Z)">Undo</button>
        )}
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <kbd>+</kbd> inc, <kbd>-</kbd> dec, <kbd>R</kbd> reset, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
