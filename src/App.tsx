import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '+' || event.key === '=') {
        setCount((prev) => prev + 1)
      } else if (event.key === '-') {
        setCount((prev) => Math.max(0, prev - 1))
      } else if (event.key.toLowerCase() === 'r') {
        setCount(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">
        Count is {count}
      </div>
      <div className="counter-container">
        <button
          className="counter-button"
          onClick={() => setCount((prev) => Math.max(0, prev - 1))}
          disabled={count === 0}
          aria-label="Decrement count"
          title="Click or press '-' to decrement"
        >
          -
        </button>
        <button
          className="counter-button"
          onClick={() => setCount((prev) => prev + 1)}
          aria-label="Increment count"
          title="Click or press '+' to increment"
        >
          +
        </button>
        <button
          className="counter-button reset-button"
          onClick={() => setCount(0)}
          disabled={count === 0}
          aria-label="Reset count"
          title={count === 0 ? "Counter is already at zero" : "Click or press 'R' to reset"}
        >
          Reset
        </button>
      </div>
    </main>
  )
}

export default App
