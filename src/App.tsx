import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const lastCountRef = useRef(0)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setShowUndo(false)
  }, [])

  const undo = useCallback(() => {
    setCount(lastCountRef.current)
    dismissUndo()
    setTimeout(() => incRef.current?.focus(), 0)
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
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = count
    setCount(0)
    setShowUndo(true)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(dismissUndo, 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count, dismissUndo])

  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if (showUndo && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (e.key === '+' || e.key === '=') {
        dismissUndo()
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        decrement()
        key = 'dec'
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
  }, [showUndo, undo, dismissUndo, count, reset, decrement])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { dismissUndo(); setCount((p) => p + 1); }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <div className="undo-toast-container">
        {showUndo && (
          <div className="undo-toast" aria-live="assertive">
            Count reset. <button className="undo-button" onClick={undo} aria-label="Undo reset" aria-keyshortcuts={`${IS_MAC ? 'Command' : 'Control'}+Z`}>Undo?</button>
            <span className="shortcut-hint">({IS_MAC ? '⌘' : 'Ctrl'}+Z)</span>
          </div>
        )}
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  )
}

export default App
