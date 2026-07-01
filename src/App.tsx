import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function App() {
  const [count, setCount] = useState(0)
  const [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)

  const countRef = useRef(0)
  const lastCountRef = useRef(0)
  const showUndoRef = useRef(false)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
    countRef.current = count
  }, [count])

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setShowUndo(false)
    showUndoRef.current = false
  }, [])

  const undo = useCallback(() => {
    setCount(lastCountRef.current)
    dismissUndo()
  }, [dismissUndo])

  const decrement = () => {
    dismissUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = useCallback(() => {
    const cur = countRef.current
    if (cur > 0) {
      lastCountRef.current = cur
      setShowUndo(true)
      showUndoRef.current = true
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(dismissUndo, 5000)
    }
    const focused = document.activeElement === resetRef.current
    setCount(0)
    if (focused) setTimeout(() => incRef.current?.focus(), 0)
  }, [dismissUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey

      if (isModifier && e.key.toLowerCase() === 'z') {
        if (showUndoRef.current) {
          e.preventDefault()
          undo()
        }
        return
      }

      // Ignore shortcuts if modifier is pressed (e.g. Ctrl+R)
      if (isModifier) return

      let key: string | null = null
      if (e.key === '+' || e.key === '=') {
        dismissUndo()
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        dismissUndo()
        setCount((p) => {
          if (p > 0) {
            key = 'dec'
            return p - 1
          }
          return p
        })
      } else if (e.key.toLowerCase() === 'r') {
        if (countRef.current > 0) {
          key = 'reset'
          reset()
        }
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [undo, dismissUndo, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button
          ref={decRef}
          className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`}
          onClick={decrement}
          disabled={count === 0}
          aria-label="Decrement count"
          aria-keyshortcuts="-"
          title="Decrement (-)"
        >
          -
        </button>
        <button
          ref={incRef}
          className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`}
          onClick={() => {
            dismissUndo()
            setCount((p) => p + 1)
          }}
          aria-label="Increment count"
          aria-keyshortcuts="+ ="
          title="Increment (+)"
        >
          +
        </button>
        <button
          ref={resetRef}
          className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`}
          onClick={reset}
          disabled={count === 0}
          aria-label="Reset count"
          aria-keyshortcuts="r"
          title="Reset (R)"
        >
          Reset
        </button>
      </div>
      {showUndo && (
        <div className="undo-toast" aria-live="assertive">
          Count reset. <button
            className="undo-button"
            onClick={undo}
            aria-label="Undo reset"
            title={`Undo (${IS_MAC ? '⌘' : 'Ctrl'}+Z)`}
          >
            Undo
          </button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong>, <strong>-</strong>, <strong>R</strong>, <strong>{IS_MAC ? '⌘' : 'Ctrl'}+Z</strong> undo
      </footer>
    </main>
  )
}

export default App
