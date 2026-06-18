import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [showUndo, setShowUndo] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const lastCountRef = useRef(0), undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  const clearUndo = useCallback(() => { setShowUndo(false); clearTimeout(undoTimerRef.current) }, [])
  const increment = useCallback(() => { clearUndo(); setCount((p) => p + 1) }, [clearUndo])
  const decrement = useCallback(() => {
    clearUndo()
    const wasFocused = document.activeElement === decRef.current
    setCount((prev) => {
      const next = Math.max(0, prev - 1)
      if (next === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0)
      return next
    })
  }, [clearUndo])

  const reset = useCallback(() => {
    if (count === 0) return
    lastCountRef.current = count
    setCount(0); setShowUndo(true)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000)
    if (document.activeElement === resetRef.current) setTimeout(() => incRef.current?.focus(), 0)
  }, [count])

  const undo = useCallback(() => { setCount(lastCountRef.current); clearUndo() }, [clearUndo])

  useEffect(() => () => clearTimeout(undoTimerRef.current), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform), modKey = isMac ? e.metaKey : e.ctrlKey
      if (modKey && e.key.toLowerCase() === 'z') { undo(); key = 'undo' }
      else if (e.key === '+' || e.key === '=') { increment(); key = 'inc' }
      else if (e.key === '-') { if (count > 0) { decrement(); key = 'dec' } }
      else if (e.key.toLowerCase() === 'r') { if (count > 0) { reset(); key = 'reset' } }

      if (key) {
        setActiveShortcut(key)
        setTimeout(() => setActiveShortcut(null), 150)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, increment, decrement, reset, undo])

  return (
    <main>
      <h1>Palette's Counter</h1>
      {showUndo && <div className="undo-toast" role="status">Reset successful. <button className="undo-button" onClick={undo} aria-label="Undo reset">Undo</button></div>}
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      <footer className="shortcut-guide" aria-label="Keyboard shortcuts">
        Shortcuts: <kbd aria-label="plus">+</kbd> inc, <kbd aria-label="minus">-</kbd> dec, <kbd aria-label="r">R</kbd> reset, <kbd aria-label="undo">{/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}+Z</kbd> undo
      </footer>
    </main>
  )
}

export default App
