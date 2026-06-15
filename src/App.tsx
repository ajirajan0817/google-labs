import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const [lastCount, setLastCount] = useState(0), [showUndo, setShowUndo] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const hideUndo = useCallback(() => { setShowUndo(false); clearTimeout(timerRef.current) }, [])
  const undo = useCallback(() => { setCount(lastCount); hideUndo() }, [lastCount, hideUndo])

  const decrement = useCallback(() => {
    const wasFocused = document.activeElement === decRef.current
    hideUndo(); setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }, [hideUndo])

  const reset = useCallback(() => {
    const wasFocused = document.activeElement === resetRef.current
    setLastCount(count); setCount(0); setShowUndo(true)
    clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isZ = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'
      if (isZ) { e.preventDefault(); undo() }
      else if (e.key === '+' || e.key === '=') { hideUndo(); setCount(p => p + 1); key = 'inc' }
      else if (e.key === '-') {
        setCount(p => { if (p > 0) { hideUndo(); key = 'dec'; return p - 1 } return p })
      } else if (e.key.toLowerCase() === 'r') { if (count > 0) { reset(); key = 'reset' } }
      if (key) { setActiveShortcut(key); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, undo, hideUndo, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      {showUndo && <div className="undo-toast" role="alert">Reset. <button className="undo-button" onClick={undo} aria-label="Undo reset">Undo</button></div>}
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => { hideUndo(); setCount(p => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  )
}

export default App
