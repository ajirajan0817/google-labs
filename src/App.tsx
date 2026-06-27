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
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const countRef = useRef(count)
  const showUndoRef = useRef(showUndo)

  countRef.current = count
  showUndoRef.current = showUndo

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  const decrement = () => {
    const wasFocused = document.activeElement === decRef.current
    if (showUndo) setShowUndo(false)
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = useCallback(() => {
    const wasFocused = document.activeElement === resetRef.current
    lastCountRef.current = countRef.current
    setCount(0)
    setShowUndo(true)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [])

  const undoReset = () => {
    setCount(lastCountRef.current)
    setShowUndo(false)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z'
      const isMod = IS_MAC ? e.metaKey : e.ctrlKey

      if (isZ && isMod && showUndoRef.current) {
        e.preventDefault()
        undoReset()
        return
      }

      let key: string | null = null
      if (e.key === '+' || e.key === '=') {
        if (showUndoRef.current) setShowUndo(false)
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        if (countRef.current > 0) {
          if (showUndoRef.current) setShowUndo(false)
          setCount((p) => p - 1)
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
  }, [reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { if (showUndo) setShowUndo(false); setCount((p) => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>

      {showUndo && (
        <div className="undo-toast" aria-live="assertive">
          Action performed. Undo?
          <button className="undo-button" onClick={undoReset} aria-label="Undo reset">Undo ({IS_MAC ? '⌘' : 'Ctrl'}+Z)</button>
        </div>
      )}

      <footer className="shortcut-guide">
        Shortcuts: <kbd title="Plus or Equal">+</kbd> inc, <kbd title="Minus">-</kbd> dec, <kbd title="R key">R</kbd> reset
        {showUndo && <>, <kbd title={IS_MAC ? 'Command + Z' : 'Control + Z'}>{IS_MAC ? '⌘' : 'Ctrl'}+Z</kbd> undo</>}
      </footer>
    </main>
  )
}

export default App
