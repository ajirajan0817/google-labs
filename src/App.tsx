import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [undoVal, setUndoVal] = useState<number | null>(null)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
    return () => clearTimeout(timerRef.current)
  }, [count])

  const mod = (val: number | ((p: number) => number)) => {
    setCount(val)
    setUndoVal(null)
  }

  const reset = useCallback(() => {
    if (count === 0) return
    setUndoVal(count)
    setCount(0)
    if (document.activeElement === resetRef.current) setTimeout(() => incRef.current?.focus(), 0)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setUndoVal(null), 5000)
  }, [count])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let k: string | null = null
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (undoVal !== null) { setCount(undoVal); setUndoVal(null); k = 'undo' }
      } else if (e.key === '+' || e.key === '=') { mod(p => p + 1); k = 'inc' }
      else if (e.key === '-' && count > 0) {
        setCount(p => { const n = p - 1; if (n === 0 && document.activeElement === decRef.current) setTimeout(() => incRef.current?.focus(), 0); return n })
        setUndoVal(null); k = 'dec'
      } else if (e.key.toLowerCase() === 'r') { reset(); k = 'reset' }

      if (k) { setActiveShortcut(k); setTimeout(() => setActiveShortcut(null), 150) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, undoVal, reset])

  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const zKey = isMac ? '⌘Z' : 'Ctrl+Z'
  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={() => { if (count > 0) { const n = count - 1; setCount(n); setUndoVal(null); if (n === 0 && document.activeElement === decRef.current) setTimeout(() => incRef.current?.focus(), 0) } }} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title={count === 0 ? "At zero" : "Decrement (-)"}>-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={() => mod(p => p + 1)} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title={count === 0 ? "At zero" : "Reset (R)"}>Reset</button>
      </div>
      {undoVal !== null && <div className="undo-toast" aria-live="assertive">Counter reset. <button className="undo-btn" onClick={() => { setCount(undoVal); setUndoVal(null); clearTimeout(timerRef.current) }} aria-label={`Undo reset (${zKey})`}>Undo ({zKey})</button></div>}
      <footer className="shortcut-guide">Shortcuts: <kbd>+</kbd> inc, <kbd>-</kbd> dec, <kbd>R</kbd> reset, <kbd>{zKey}</kbd> undo</footer>
    </main>
  )
}

export default App
