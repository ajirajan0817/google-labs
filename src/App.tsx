import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [undo, setUndo] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const decrement = () => {
    setUndo(0)
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }

  const reset = useCallback(() => {
    if (!count) return
    setUndo(count); setCount(0)
    clearTimeout(timer.current); timer.current = setTimeout(() => setUndo(0), 5000)
    if (document.activeElement === resetRef.current) incRef.current?.focus()
  }, [count])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && undo) {
        setCount(undo);
        setUndo(0);
        key = 'undo'
      } else if (e.key === '+' || e.key === '=') {
        setUndo(0);
        setCount((p) => p + 1)
        key = 'inc'
      } else if (e.key === '-') {
        if (count > 0) {
          setUndo(0);
          setCount((p) => p - 1)
          key = 'dec'
        }
      } else if (e.key.toLowerCase() === 'r' && count > 0) {
        reset();
        key = 'reset'
      }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, count, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is <span data-testid="count-value">{count}</span></div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { setUndo(0); setCount((p) => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {undo > 0 && <div className="undo-toast" role="status">Counter reset. <button onClick={() => { setCount(undo); setUndo(0) }} className="undo-button">Undo</button> <kbd>{/Mac/.test(navigator.platform) ? '⌘Z' : 'Ctrl+Z'}</kbd></div>}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{/Mac/.test(navigator.platform) ? '⌘Z' : 'Ctrl+Z'}</strong> undo
      </footer>
    </main>
  )
}

export default App
