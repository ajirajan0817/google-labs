import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function App() {
  const [count, setCount] = useState(0)
  const [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const increment = useCallback(() => {
    setCount((p) => p + 1)
    dismissUndo()
  }, [dismissUndo])

  const decrement = useCallback(() => {
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
    dismissUndo()
  }, [dismissUndo])

  const reset = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = count
    setCount(0)
    dismissUndo()
    setShowUndo(true)
    undoTimerRef.current = setTimeout(dismissUndo, 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count, dismissUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = e.key.toLowerCase() === 'z' && (IS_MAC ? e.metaKey : e.ctrlKey)

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
      } else if (isUndo && showUndo) {
        e.preventDefault()
        undo()
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [increment, decrement, reset, undo, showUndo, count])

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
          Count reset. <button className="undo-button" onClick={undo} aria-label="Undo reset" title={`Undo (${IS_MAC ? '⌘Z' : 'Ctrl+Z'})`}>Undo?</button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{IS_MAC ? '⌘Z' : 'Ctrl+Z'}</strong> undo
      </footer>
    </main>
  )
}

export default App
