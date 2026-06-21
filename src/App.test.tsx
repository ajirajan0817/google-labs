import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('increments, decrements and resets counter', () => {
  render(<App />)

  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const decrementBtn = screen.getByRole('button', { name: /decrement count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  const display = screen.getByText(/count is 0/i)

  // Check initial state
  expect(display).toBeInTheDocument()
  expect(decrementBtn).toBeDisabled()
  expect(resetBtn).toBeDisabled()

  // Increment
  fireEvent.click(incrementBtn)
  expect(screen.getByText(/count is 1/i)).toBeInTheDocument()
  expect(decrementBtn).not.toBeDisabled()
  expect(resetBtn).not.toBeDisabled()

  // Decrement
  fireEvent.click(decrementBtn)
  expect(screen.getByText(/count is 0/i)).toBeInTheDocument()
  expect(decrementBtn).toBeDisabled()
  expect(resetBtn).toBeDisabled()

  // Reset check
  fireEvent.click(incrementBtn)
  fireEvent.click(resetBtn)
  expect(screen.getByText(/count is 0/i)).toBeInTheDocument()
})

test('updates document title with current count', () => {
  render(<App />)
  expect(document.title).toBe('Count: 0 | Palette Counter')

  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  fireEvent.click(incrementBtn)
  expect(document.title).toBe('Count: 1 | Palette Counter')

  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  fireEvent.click(resetBtn)
  expect(document.title).toBe('Count: 0 | Palette Counter')
})

test('handles keyboard shortcuts', () => {
  render(<App />)

  // Increment with '+'
  fireEvent.keyDown(window, { key: '+' })
  expect(screen.getByText(/count is 1/i)).toBeInTheDocument()

  // Increment with '='
  fireEvent.keyDown(window, { key: '=' })
  expect(screen.getByText(/count is 2/i)).toBeInTheDocument()

  // Decrement with '-'
  fireEvent.keyDown(window, { key: '-' })
  expect(screen.getByText(/count is 1/i)).toBeInTheDocument()

  // Reset with 'r'
  fireEvent.keyDown(window, { key: 'r' })
  expect(screen.getByText(/count is 0/i)).toBeInTheDocument()

  // Reset with 'R'
  fireEvent.keyDown(window, { key: '+' })
  fireEvent.keyDown(window, { key: 'R' })
  expect(screen.getByText(/count is 0/i)).toBeInTheDocument()
})

test('allows undoing a reset via UI and keyboard', async () => {
  const { vi } = await import('vitest')
  vi.useFakeTimers()
  render(<App />)

  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })

  // 1. UI Undo
  fireEvent.click(incrementBtn) // count = 1
  fireEvent.click(incrementBtn) // count = 2
  fireEvent.click(resetBtn)      // count = 0, show undo

  const undoBtn = screen.getByRole('button', { name: /undo reset/i })
  expect(undoBtn).toBeInTheDocument()
  fireEvent.click(undoBtn)
  expect(screen.getByText(/count is 2/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /undo reset/i })).not.toBeInTheDocument()

  // 2. Keyboard Undo
  fireEvent.click(resetBtn)
  expect(screen.getByRole('button', { name: /undo reset/i })).toBeInTheDocument()
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
  expect(screen.getByText(/count is 2/i)).toBeInTheDocument()

  // 3. Undo expires after 5s
  fireEvent.click(resetBtn)
  expect(screen.getByRole('button', { name: /undo reset/i })).toBeInTheDocument()
  const { act } = await import('react')
  await act(async () => {
    vi.advanceTimersByTime(5000)
  })
  expect(screen.queryByRole('button', { name: /undo reset/i })).not.toBeInTheDocument()

  // 4. Undo cleared on next action
  fireEvent.click(incrementBtn) // count = 3
  fireEvent.click(resetBtn)      // count = 0, show undo
  expect(screen.getByRole('button', { name: /undo reset/i })).toBeInTheDocument()
  fireEvent.click(incrementBtn) // count = 1
  expect(screen.queryByRole('button', { name: /undo reset/i })).not.toBeInTheDocument()

  vi.useRealTimers()
})
