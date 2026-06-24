import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const IS_MAC = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

function App() {
  const [count, setCount] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  const incRef = useRef<HTMLButtonElement>(null);
  const decRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const lastCountRef = useRef(0);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Refs for current state to avoid re-binding keyboard listeners
  const countRef = useRef(count);
  const showUndoRef = useRef(showUndo);
  useEffect(() => { countRef.current = count; }, [count]);
  useEffect(() => { showUndoRef.current = showUndo; }, [showUndo]);

  useEffect(() => {
    document.title = `Count: ${count} | Palette Counter`;
  }, [count]);

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);

  const triggerUndo = useCallback((val: number) => {
    lastCountRef.current = val;
    setShowUndo(true);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000);
  }, []);

  const undoReset = useCallback(() => {
    setCount(lastCountRef.current);
    setShowUndo(false);
    clearTimeout(undoTimerRef.current);
  }, []);

  const increment = useCallback(() => {
    setCount(p => p + 1);
    setShowUndo(false);
  }, []);

  const decrement = useCallback(() => {
    const wasFocused = document.activeElement === decRef.current;
    setCount(p => {
      const n = Math.max(0, p - 1);
      if (n === 0 && wasFocused) setTimeout(() => incRef.current?.focus(), 0);
      return n;
    });
    setShowUndo(false);
  }, []);

  const reset = useCallback(() => {
    triggerUndo(countRef.current);
    setCount(0);
    if (document.activeElement === resetRef.current) {
      setTimeout(() => incRef.current?.focus(), 0);
    }
  }, [triggerUndo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key: string | null = null;
      const isMod = IS_MAC ? e.metaKey : e.ctrlKey;

      if (isMod && e.key.toLowerCase() === 'z' && showUndoRef.current) {
        undoReset();
        return;
      }

      if (e.key === '+' || e.key === '=') {
        increment();
        key = 'inc';
      } else if (e.key === '-') {
        if (countRef.current > 0) {
          decrement();
          key = 'dec';
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (countRef.current > 0) {
          reset();
          key = 'reset';
        }
      }

      if (key) {
        setActiveShortcut(key);
        setTimeout(() => setActiveShortcut(null), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increment, decrement, reset, undoReset]);

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
          onClick={increment}
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
          Counter reset.
          <button onClick={undoReset} className="undo-button" aria-label="Undo reset">Undo</button>
          <kbd>{IS_MAC ? '⌘' : 'Ctrl'}+Z</kbd>
        </div>
      )}

      <footer className="shortcut-guide">
        Shortcuts: <strong>+</strong> inc, <strong>-</strong> dec, <strong>R</strong> reset
      </footer>
    </main>
  );
}

export default App
