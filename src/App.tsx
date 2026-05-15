import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="counter-container">
        <button
          className="counter-button"
          onClick={() => setCount(count + 1)}
          aria-label={`Increment count. Current count is ${count}`}
          title="Click to increment"
        >
          Count is {count}
        </button>
        <button
          className="counter-button reset-button"
          onClick={() => setCount(0)}
          disabled={count === 0}
          aria-label="Reset count"
          title={count === 0 ? "Counter is already at zero" : "Click to reset count"}
        >
          Reset
        </button>
      </div>
    </main>
  )
}

export default App
