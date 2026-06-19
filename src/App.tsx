import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showUndo, setShowUndo] = useState(false)

  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const countRef = useRef(0)
  const lastCountRef = useRef(0)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    countRef.current = count
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  useEffect(() => {
    return () => clearTimeout(undoTimerRef.current)
  }, [])

  const clearUndo = useCallback(() => {
    setShowUndo(false)
    clearTimeout(undoTimerRef.current)
  }, [])

  const undoReset = useCallback(() => {
    if (lastCountRef.current > 0) {
      setCount(lastCountRef.current)
      lastCountRef.current = 0
      clearUndo()
    }
  }, [clearUndo])

  const increment = useCallback(() => {
    setCount((p) => p + 1)
    clearUndo()
  }, [clearUndo])

  const decrement = useCallback(() => {
    const wasFocused = document.activeElement === decRef.current
    setCount((p) => {
      const next = Math.max(0, p - 1)
      if (next === 0 && wasFocused) {
        setTimeout(() => incRef.current?.focus(), 0)
      }
      return next
    })
    clearUndo()
  }, [clearUndo])

  const reset = useCallback(() => {
    lastCountRef.current = countRef.current
    setCount(0)
    if (document.activeElement === resetRef.current) {
      setTimeout(() => incRef.current?.focus(), 0)
    }
    setShowUndo(true)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isMac = /Mac/.test(navigator.userAgent)
      const isZ = e.key.toLowerCase() === 'z'
      const isUndoShortcut = isMac ? (e.metaKey && isZ) : (e.ctrlKey && isZ)

      if (e.key === '+' || e.key === '=') {
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
      } else if (isUndoShortcut) {
        if (lastCountRef.current > 0 && document.querySelector('.undo-toast')) {
          undoReset()
          key = 'undo'
        }
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [increment, decrement, reset, undoReset])

  const isMacPlatform = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent)

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
          Reset successful. <button className="undo-button" onClick={undoReset} aria-label="Undo reset" aria-keyshortcuts={isMacPlatform ? 'Meta+Z' : 'Control+Z'}>Undo</button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong>, <strong>-</strong>, <strong>R</strong>, <strong>{isMacPlatform ? '⌘Z' : 'Ctrl+Z'}</strong> undo
      </footer>
    </main>
  )
}

export default App
