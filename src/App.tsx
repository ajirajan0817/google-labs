import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

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
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') setCount((p) => p + 1)
      else if (e.key === '-') decrement()
      else if (e.key.toLowerCase() === 'r') reset()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className="counter-button" onClick={decrement} disabled={count === 0} aria-label="Decrement count" title="Decrement (-)">-</button>
        <button ref={incRef} className="counter-button" onClick={() => setCount((p) => p + 1)} aria-label="Increment count" title="Increment (+)">+</button>
        <button ref={resetRef} className="counter-button reset-button" onClick={reset} disabled={count === 0} aria-label="Reset count" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  )
}

export default App
