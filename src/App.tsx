import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="counter-container">
        <button
          className="counter-button"
          onClick={() => setCount(count + 1)}
          title="Click to increment"
        >
          Count is {count}
        </button>
        <button
          className="counter-button reset-button"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
    </main>
  )
}

export default App
