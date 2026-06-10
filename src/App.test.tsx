import { render, screen, fireEvent, act } from '@testing-library/react'
import { expect, test, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('increments, decrements and resets counter', () => {
  render(<App />)

  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const decrementBtn = screen.getByRole('button', { name: /decrement count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  const display = screen.getByTestId('count-value')

  // Check initial state
  expect(display).toHaveTextContent('0')
  expect(decrementBtn).toBeDisabled()
  expect(resetBtn).toBeDisabled()

  // Increment
  fireEvent.click(incrementBtn)
  expect(display).toHaveTextContent('1')
  expect(decrementBtn).not.toBeDisabled()
  expect(resetBtn).not.toBeDisabled()

  // Decrement
  fireEvent.click(decrementBtn)
  expect(display).toHaveTextContent('0')
  expect(decrementBtn).toBeDisabled()
  expect(resetBtn).toBeDisabled()

  // Reset check
  fireEvent.click(incrementBtn)
  fireEvent.click(incrementBtn)
  expect(display).toHaveTextContent('2')
  fireEvent.click(resetBtn)
  expect(display).toHaveTextContent('0')
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
  const display = screen.getByTestId('count-value')

  // Increment with '+'
  fireEvent.keyDown(window, { key: '+' })
  expect(display).toHaveTextContent('1')

  // Increment with '='
  fireEvent.keyDown(window, { key: '=' })
  expect(display).toHaveTextContent('2')

  // Decrement with '-'
  fireEvent.keyDown(window, { key: '-' })
  expect(display).toHaveTextContent('1')

  // Reset with 'r'
  fireEvent.keyDown(window, { key: 'r' })
  expect(display).toHaveTextContent('0')

  // Reset with 'R'
  fireEvent.keyDown(window, { key: '+' })
  fireEvent.keyDown(window, { key: 'R' })
  expect(display).toHaveTextContent('0')
})

test('undoes reset action', async () => {
  render(<App />)
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  const display = screen.getByTestId('count-value')

  fireEvent.click(incrementBtn)
  fireEvent.click(incrementBtn)
  expect(display).toHaveTextContent('2')

  fireEvent.click(resetBtn)
  expect(display).toHaveTextContent('0')

  const undoBtn = screen.getByRole('button', { name: /undo/i })
  expect(undoBtn).toBeInTheDocument()

  fireEvent.click(undoBtn)
  expect(display).toHaveTextContent('2')
  expect(undoBtn).not.toBeInTheDocument()
})

test('undo notification disappears after 5 seconds', async () => {
  render(<App />)
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })

  fireEvent.click(incrementBtn)
  fireEvent.click(resetBtn)
  expect(screen.getByText(/reset\./i)).toBeInTheDocument()

  await act(async () => {
    vi.advanceTimersByTime(5000)
  })

  expect(screen.queryByText(/reset\./i)).not.toBeInTheDocument()
})

test('incrementing clears undo state', () => {
  render(<App />)
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })

  fireEvent.click(incrementBtn)
  fireEvent.click(resetBtn)
  expect(screen.getByText(/reset\./i)).toBeInTheDocument()

  fireEvent.click(incrementBtn)
  expect(screen.queryByText(/reset\./i)).not.toBeInTheDocument()
})

test('undo via keyboard shortcut', () => {
  render(<App />)
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  const display = screen.getByTestId('count-value')

  fireEvent.click(incrementBtn)
  fireEvent.click(resetBtn)
  expect(display).toHaveTextContent('0')

  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
  expect(display).toHaveTextContent('1')
})
