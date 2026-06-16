import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const lastCountRef = useRef<number | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    return () => clearTimeout(undoTimerRef.current)
  }, [])

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => {
    setShowUndo(false)
    lastCountRef.current = null
    clearTimeout(undoTimerRef.current)
  }, [])

  const increment = useCallback(() => {
    setCount((p) => p + 1)
    clearUndo()
  }, [clearUndo])

  const decrement = useCallback(() => {
    if (count === 0) return
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => Math.max(0, prev - 1))
    if (count === 1 && wasFocused) {
      setTimeout(() => incRef.current?.focus(), 0)
    }
    clearUndo()
  }, [count, clearUndo])

  const reset = useCallback(() => {
    if (count === 0) return
    lastCountRef.current = count
    setCount(0)
    setShowUndo(true)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    const wasFocused = document.activeElement === resetRef.current
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])

  const undo = useCallback(() => {
    if (lastCountRef.current !== null) {
      setCount(lastCountRef.current)
      clearUndo()
    }
  }, [clearUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      const modifier = isMac ? e.metaKey : e.ctrlKey
      let key: string | null = null

      if (modifier && e.key.toLowerCase() === 'z' && showUndo) {
        undo()
        key = 'undo'
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
  }, [count, showUndo, increment, decrement, reset, undo])

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
        <div className="undo-toast" role="status">
          Reset to 0. <button onClick={undo} className="undo-button" aria-label="Undo reset" aria-keyshortcuts={/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'Meta+Z' : 'Control+Z'}>Undo</button> <kbd>{/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}+Z</kbd>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  )
}

export default App
