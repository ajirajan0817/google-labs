import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const [undoCount, setUndoCount] = useState<number | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
    if (count > 0 && undoCount !== null) setUndoCount(null)
  }, [count, undoCount])

  useEffect(() => {
    if (undoCount !== null) {
      const timer = setTimeout(() => setUndoCount(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [undoCount])

  const decrement = () => {
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = () => {
    const wasFocused = document.activeElement === resetRef.current
    if (count > 0) setUndoCount(count)
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }

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
        setCount((p) => {
          if (p > 0) {
            key = 'reset'
            return 0
          }
          return p
        })
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => setCount((p) => p + 1)} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
      {undoCount !== null && (
        <div className="undo-toast">
          <button onClick={() => { setCount(undoCount); setUndoCount(null) }} className="undo-link" aria-label={`Undo reset to ${undoCount}`}>
            Undo Reset (to {undoCount})
          </button>
        </div>
      )}
    </main>
  )
}

export default App
