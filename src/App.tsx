import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const countRef = useRef(count)
  const [isMac] = useState(() => /Mac|iPod|iPhone|iPad/.test(navigator.userAgent))
  const showUndoRef = useRef(showUndo)
  const lastCountRef = useRef(0)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    countRef.current = count
    showUndoRef.current = showUndo
    document.title = `Count: ${count} | Palette Counter`
  }, [count, showUndo])

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setShowUndo(false)
  }, [])

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
    if (countRef.current === 0) return
    dismissUndo()
    lastCountRef.current = countRef.current
    setShowUndo(true)
    const wasFocused = document.activeElement === resetRef.current
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
  }, [dismissUndo])

  const undo = useCallback(() => {
    setCount(lastCountRef.current)
    dismissUndo()
  }, [dismissUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (showUndoRef.current) {
          e.preventDefault()
          undo()
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
  }, [decrement, increment, reset, undo])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {showUndo && (
        <div className="undo-toast" aria-live="assertive">
          Count reset. <button className="undo-button" onClick={undo} aria-label="Undo reset">Undo?</button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{isMac ? '⌘' : 'Ctrl'}+Z</strong> undo
      </footer>
    </main>
  )
}

export default App
