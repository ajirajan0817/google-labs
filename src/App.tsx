import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const undoTimerRef = useRef<number | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = () => {
    setShowUndo(false)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  const decrement = () => {
    clearUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = () => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    setLastCount(count)
    setShowUndo(true)
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(() => setShowUndo(false), 5000)
  }

  const undo = () => {
    setCount((current) => {
      if (lastCount !== null) {
        return lastCount
      }
      return current
    })
    clearUndo()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndoShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'

      if (isUndoShortcut && showUndo) {
        undo()
        key = 'undo'
      } else if (e.key === '+' || e.key === '=') {
        increment()
        key = 'inc'
      } else if (e.key === '-') {
        setCount((p) => {
          if (p > 0) {
            decrement()
            key = 'dec'
          }
          return p
        })
      } else if (e.key.toLowerCase() === 'r') {
        setCount((p) => {
          if (p > 0) {
            reset()
            key = 'reset'
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [showUndo, count])

  const increment = () => {
    clearUndo()
    setCount((p) => p + 1)
  }

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">
        Count is <span data-testid="count-value">{count}</span>
      </div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
        {showUndo && (
          <button className={`counter-button undo-button ${activeShortcut === 'undo' ? 'active' : ''}`} onClick={undo} aria-label="Undo reset" aria-keyshortcuts="Control+Z Meta+Z" title="Undo Reset (Ctrl+Z)">Undo</button>
        )}
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset{showUndo && <>, <strong>Ctrl+Z</strong> undo</>}
      </footer>
    </main>
  )
}

export default App
