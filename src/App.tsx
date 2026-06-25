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
  const lastCountRef = useRef<number>(0)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const startUndoTimer = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setShowUndo(true)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
  }, [])

  const undo = useCallback(() => {
    setCount(lastCountRef.current)
    setShowUndo(false)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }, [])

  const increment = useCallback(() => {
    setCount((p) => p + 1)
    setShowUndo(false)
  }, [])

  const decrement = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === decRef.current
    lastCountRef.current = count
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
    startUndoTimer()
  }, [count, startUndoTimer])

  const reset = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = count
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    startUndoTimer()
  }, [count, startUndoTimer])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isMod = IS_MAC ? e.metaKey : e.ctrlKey

      if (isMod && e.key.toLowerCase() === 'z') {
        if (showUndo) {
          e.preventDefault()
          undo()
          key = 'undo'
        }
      } else if (e.key === '+' || e.key === '=') {
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
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, decrement, increment, reset, showUndo, undo])

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
          Action performed. <button className="undo-button" onClick={undo} aria-label="Undo action" aria-keyshortcuts={IS_MAC ? 'Meta+Z' : 'Control+Z'}>Undo</button>
        </div>
      )}

      <footer className="shortcut-guide">
        Shortcuts: <kbd title="Increment">+</kbd> inc, <kbd title="Decrement">-</kbd> dec, <kbd title="Reset">R</kbd> reset, <kbd title="Undo">{IS_MAC ? '⌘' : 'Ctrl'}+Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
