import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0), [last, setLast] = useState<number | null>(null), [active, setActive] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined), incRef = useRef<HTMLButtonElement>(null), decRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { document.title = `Count: ${count} | Palette Counter` }, [count])
  useEffect(() => () => clearTimeout(timerRef.current), [])
  const clear = useCallback(() => { clearTimeout(timerRef.current); setLast(null) }, [])
  const dec = useCallback(() => {
    const focused = document.activeElement === decRef.current
    clear(); setCount(p => {
      const n = Math.max(0, p - 1)
      if (n === 0 && focused) setTimeout(() => incRef.current?.focus(), 0)
      return n
    })
  }, [clear])
  const reset = useCallback(() => {
    if (count === 0) return
    const focused = document.activeElement === resetRef.current
    setLast(count); setCount(0); if (focused) setTimeout(() => incRef.current?.focus(), 0)
    clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setLast(null), 5000)
  }, [count])
  const undo = useCallback(() => { if (last !== null) { setCount(last); clear() } }, [last, clear])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'
      let k: string | null = null
      if (isUndo && last !== null) { undo(); k = 'undo' }
      else if (e.key === '+' || e.key === '=') { clear(); setCount(p => p + 1); k = 'inc' }
      else if (e.key === '-') { if (count > 0) { dec(); k = 'dec' } }
      else if (e.key.toLowerCase() === 'r') { if (count > 0) { reset(); k = 'reset' } }
      if (k) { setActive(k); setTimeout(() => setActive(null), 150) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [count, last, dec, reset, undo, clear])
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  return (
    <main>
      <h1>Palette's Counter</h1>
      <div className="count-display" aria-live="polite">Count is {count}</div>
      <div className="counter-container">
        <button ref={decRef} className={`counter-button ${active === 'dec' ? 'active' : ''}`} onClick={dec} disabled={count === 0} aria-label="Decrement count" aria-keyshortcuts="-" title="Decrement (-)">-</button>
        <button ref={incRef} className={`counter-button ${active === 'inc' ? 'active' : ''}`} onClick={() => { clear(); setCount(p => p + 1) }} aria-label="Increment count" aria-keyshortcuts="+ =" title="Increment (+)">+</button>
        <button ref={resetRef} className={`counter-button reset-button ${active === 'reset' ? 'active' : ''}`} onClick={reset} disabled={count === 0} aria-label="Reset count" aria-keyshortcuts="r" title="Reset (R)">Reset</button>
      </div>
      {last !== null && <div className="undo-toast" role="status">Counter reset. <button className="undo-button" onClick={undo} aria-label={`Undo reset (${isMac ? 'Command' : 'Control'}+Z)`}>Undo</button></div>}
      <footer className="shortcut-guide">Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset, <strong>{isMac ? '⌘' : 'Ctrl'}+Z</strong> undo</footer>
    </main>
  )
}

export default App
