import { render, screen, fireEvent, act } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
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

test('undo functionality restores state and expires after 5s', async () => {
  vi.useFakeTimers()
  render(<App />)
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  for (let i = 0; i < 5; i++) fireEvent.click(incrementBtn)
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  fireEvent.click(resetBtn)
  const undoBtn = screen.getByRole('button', { name: /undo/i })
  expect(undoBtn).toBeInTheDocument()
  fireEvent.click(undoBtn)
  expect(screen.getByText(/count is 5/i)).toBeInTheDocument()
  fireEvent.click(resetBtn)
  await act(async () => { vi.advanceTimersByTime(5000); vi.runAllTimers() })
  expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
  vi.useRealTimers()
})

test('subsequent actions clear undo state', () => {
  render(<App />)
  const inc = screen.getByRole('button', { name: /increment count/i }), res = screen.getByRole('button', { name: /reset count/i })
  fireEvent.click(inc); fireEvent.click(res)
  expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
  fireEvent.click(inc)
  expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
})
