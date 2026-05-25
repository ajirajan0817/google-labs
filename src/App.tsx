import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    setShowUndo(false)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
  }, [])

  const undoReset = useCallback(() => {
    if (lastCount !== null) {
      setCount(lastCount)
      clearUndo()
    }
  }, [lastCount, clearUndo])

  const decrement = () => {
    const wasFocused = document.activeElement === decRef.current
    clearUndo()
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === resetRef.current
    setLastCount(count)
    setCount(0)
    setShowUndo(true)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(() => setShowUndo(false), 5000)
  }, [count])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && showUndo) {
        undoReset()
        return
      }
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
  }, [count, showUndo, undoReset, clearUndo, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label={count === 0 ? "Decrement count (Already at zero)" : "Decrement count"} aria-keyshortcuts="-" title={count === 0 ? "Already at zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { clearUndo(); setCount((p) => p + 1); }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label={count === 0 ? "Reset count (Already at zero)" : "Reset count"} aria-keyshortcuts="r" title={count === 0 ? "Already at zero" : "Reset (R)"}>Reset</button>
      </div>
      {showUndo && <div style={{ marginTop: '1rem' }}><button className="counter-button" onClick={undoReset} aria-label="Undo reset" aria-keyshortcuts="Control+Z" title="Undo (Ctrl+Z)">Undo Reset</button></div>}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset{showUndo && <>, <strong>Ctrl+Z</strong> undo</>}
      </footer>
    </main>
  )
}

export default App
