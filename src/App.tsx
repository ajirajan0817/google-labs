import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [prevCount, setPrevCount] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearUndo = useCallback(() => {
    setPrevCount(null)
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const increment = useCallback(() => {
    clearUndo()
    setCount((p) => p + 1)
  }, [clearUndo])

  const decrement = useCallback(() => {
    const wasFocused = document.activeElement === decRef.current
    clearUndo()
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }, [clearUndo])

  const reset = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    setPrevCount(count)
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)

    undoTimerRef.current = setTimeout(() => {
      setPrevCount(null)
      undoTimerRef.current = null
    }, 5000)
  }, [count])

  const undoReset = useCallback(() => {
    if (prevCount !== null) {
      setCount(prevCount)
      clearUndo()
    }
  }, [prevCount, clearUndo])

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
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (prevCount !== null) {
          undoReset()
        }
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [increment, decrement, reset, undoReset, count, prevCount])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">
        Count is {count}
        {prevCount !== null && (
          <div className="undo-container">
            <button className="undo-button" onClick={undoReset} aria-label="Undo reset">
              Undo Reset?
            </button>
          </div>
        )}
      </div>
      <div className="counter-container">
        <button
          ref={decRef}
          className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`}
          onClick={decrement}
          disabled={count === 0}
          aria-label="Decrement count"
          aria-keyshortcuts="-"
          title={count === 0 ? "Already at zero" : "Decrement (-)"}
        >
          -
        </button>
        <button
          ref={incRef}
          className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`}
          onClick={increment}
          aria-label="Increment count"
          aria-keyshortcuts="+ ="
          title="Increment (+)"
        >
          +
        </button>
        <button
          ref={resetRef}
          className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`}
          onClick={reset}
          disabled={count === 0}
          aria-label="Reset count"
          aria-keyshortcuts="r"
          title={count === 0 ? "Already at zero" : "Reset (R)"}
        >
          Reset
        </button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <kbd aria-hidden="true">+</kbd> inc, <kbd aria-hidden="true">-</kbd> dec, <kbd aria-hidden="true">R</kbd> reset
        {prevCount !== null && <>, <kbd aria-hidden="true">Ctrl/⌘+Z</kbd> undo</>}
      </footer>
    </main>
  )
}

export default App
