import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [isUndoVisible, setIsUndoVisible] = useState(false)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setIsUndoVisible(false)
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

  const reset = useCallback(() => {
    if (isUndoVisible && lastCount !== null) {
      setCount(lastCount)
      clearUndo()
      return
    }
    const wasFocused = document.activeElement === resetRef.current
    setLastCount(count)
    setIsUndoVisible(true)
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    undoTimerRef.current = setTimeout(() => setIsUndoVisible(false), 5000)
  }, [count, isUndoVisible, lastCount])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if (e.key === '+' || e.key === '=') {
        clearUndo()
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        setCount((p) => {
          if (p > 0) {
            clearUndo()
            key = 'dec'
            return p - 1
          }
          return p
        })
      } else if (e.key.toLowerCase() === 'r') {
        if (isUndoVisible || count > 0) {
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
  }, [count, isUndoVisible, lastCount, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { clearUndo(); setCount((p) => p + 1); }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0 && !isUndoVisible} aria-label={isUndoVisible ? "Undo reset" : "Reset count"} aria-keyshortcuts="r" title={isUndoVisible ? "Undo (R)" : "Reset (R)"}>{isUndoVisible ? 'Undo' : 'Reset'}</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <kbd>+</kbd> inc, <kbd>-</kbd> dec, <kbd>R</kbd> {isUndoVisible ? 'undo' : 'reset'}
      </footer>
    </main>
  )
}

export default App
