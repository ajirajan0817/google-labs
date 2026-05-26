import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [undo, setUndo] = useState<number | null>(null), timer = useRef<number>(0)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const decrement = useCallback(() => {
    setUndo(null); setCount(p => Math.max(0, p - 1))
    if (count === 1 && document.activeElement === decRef.current) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])
  const reset = useCallback(() => {
    if (count > 0) {
      setUndo(count); setCount(0); window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setUndo(null), 5000)
      if (document.activeElement === resetRef.current) setTimeout(() => incRef.current?.focus(), 0)
    }
  }, [count])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'
      if (isUndo && undo !== null) { setCount(undo); setUndo(null); key = 'undo' }
      else if (e.key === '+' || e.key === '=') { setUndo(null); setCount(p => p + 1); key = 'inc' }
      else if (e.key === '-' && count > 0) { decrement(); key = 'dec' }
      else if (e.key.toLowerCase() === 'r' && count > 0) { reset(); key = 'reset' }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, undo, decrement, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { setUndo(null); setCount(p => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
        {undo !== null && <button className={`counter-button ${activeShortcut === 'undo' ? 'active' : ''}`} onClick={() => { setCount(undo); setUndo(null) }} aria-label="Undo reset" aria-keyshortcuts="Control+Z" title="Undo Reset (Ctrl+Z)">Undo</button>}
      </div>
      <footer className="shortcut-guide">Shortcuts: <kbd>+</kbd> inc, <kbd>-</kbd> dec, <kbd>R</kbd> reset{undo !== null && <>, <kbd>Ctrl+Z</kbd> undo</>}</footer>
    </main>
  )
}

export default App
