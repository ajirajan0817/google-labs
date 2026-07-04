import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef = useRef(count)
  const showUndoRef = useRef(showUndo)

  useEffect(() => {
    countRef.current = count
    showUndoRef.current = showUndo
  }, [count, showUndo])

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const dismissUndo = useCallback(() => {
    setShowUndo(false)
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  const undo = useCallback(() => {
    setCount(lastCountRef.current)
    dismissUndo()
  }, [dismissUndo])

  const increment = useCallback(() => {
    dismissUndo()
    setCount((p) => p + 1)
  }, [dismissUndo])

  const decrement = useCallback(() => {
    dismissUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }, [dismissUndo])

  const reset = useCallback(() => {
    if (count === 0) return
    lastCountRef.current = count
    const wasFocused = document.activeElement === resetRef.current
    setCount(0)
    setShowUndo(true)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(dismissUndo, 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count, dismissUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'

      if (isUndo) {
        if (showUndoRef.current) {
          undo()
          key = 'undo'
        }
      } else if (e.key === '+' || e.key === '=') {
        increment()
        key = 'inc'
      } else if (e.key === '-') {
        if (countRef.current > 0) {
          decrement()
          key = 'dec'
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (countRef.current > 0) {
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
  }, [undo, increment, decrement, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>

      <div className="undo-toast-container" aria-live="assertive">
        {showUndo && (
          <div className="undo-toast">
            <span>Count reset.</span>
            <button
              onClick={undo}
              className={`undo-button ${activeShortcut === 'undo' ? 'active' : ''}`}
              aria-label="Undo reset"
              aria-keyshortcuts={`${IS_MAC ? 'Command' : 'Control'}+Z`}
            >
              Undo?
            </button>
          </div>
        )}
      </div>

      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{IS_MAC ? '⌘' : 'Ctrl'}Z</strong> undo
      </footer>
    </main>
  )
}

export default App
