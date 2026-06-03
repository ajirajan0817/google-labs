import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [undoState, setUndoState] = useState<{ show: boolean; prev: number }>({ show: false, prev: 0 })
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const undoTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`
  }, [count])

  useEffect(() => {
    return () => { if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current) }
  }, [])

  const clearUndo = useCallback(() => {
    setUndoState({ show: false, prev: 0 })
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  const undo = useCallback(() => { setCount(undoState.prev); clearUndo() }, [undoState.prev, clearUndo])
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
    const wasFocused = document.activeElement === resetRef.current
    setUndoState({ show: true, prev: count })
    setCount(0)
    if (wasFocused) setTimeout(() => incRef.current?.focus(), 0)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(() => setUndoState({ show: false, prev: 0 }), 5000)
  }, [count])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'
      if (isUndo && undoState.show) { undo(); key = 'undo' }
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
  }, [count, undoState.show, undo, increment, decrement, reset])

  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${activeShortcut === 'dec' ? 'active' : ''}`} onClick={decrement} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${activeShortcut === 'inc' ? 'active' : ''}`} onClick={increment} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${activeShortcut === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {undoState.show && (
        <div className="undo-notification" role="status">
          Counter reset. <button className="undo-button" onClick={undo} aria-label="Undo reset" aria-keyshortcuts="Control+Z">Undo</button>
        </div>
      )}
      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset{undoState.show && <>, <strong>Ctrl+Z</strong> undo</>}
      </footer>
    </main>
  )
}

export default App
