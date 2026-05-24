import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('increments, decrements and resets counter', () => {
  render(<App />)

  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  const decrementBtn = screen.getByRole('button', { name: /decrement count/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  const displayValue = screen.getByTestId('count-value')

  // Check initial state
  expect(displayValue).toHaveTextContent('0')
  expect(decrementBtn).toBeDisabled()
  expect(resetBtn).toBeDisabled()

  // Increment
  fireEvent.click(incrementBtn)
  expect(displayValue).toHaveTextContent('1')
  expect(decrementBtn).not.toBeDisabled()
  expect(resetBtn).not.toBeDisabled()

  // Decrement
  fireEvent.click(decrementBtn)
  expect(displayValue).toHaveTextContent('0')
  expect(decrementBtn).toBeDisabled()
  expect(resetBtn).toBeDisabled()

  // Reset check
  fireEvent.click(incrementBtn)
  fireEvent.click(resetBtn)
  expect(displayValue).toHaveTextContent('0')
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
  const displayValue = screen.getByTestId('count-value')

  // Increment with '+'
  fireEvent.keyDown(window, { key: '+' })
  expect(displayValue).toHaveTextContent('1')

  // Increment with '='
  fireEvent.keyDown(window, { key: '=' })
  expect(displayValue).toHaveTextContent('2')

  // Decrement with '-'
  fireEvent.keyDown(window, { key: '-' })
  expect(displayValue).toHaveTextContent('1')

  // Reset with 'r'
  fireEvent.keyDown(window, { key: 'r' })
  expect(displayValue).toHaveTextContent('0')

  // Reset with 'R'
  fireEvent.keyDown(window, { key: '+' })
  fireEvent.keyDown(window, { key: 'R' })
  expect(displayValue).toHaveTextContent('0')
})

test('provides undo functionality for reset', () => {
  render(<App />)
  const displayValue = screen.getByTestId('count-value')
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })

  // Increment to 5
  for (let i = 0; i < 5; i++) fireEvent.click(incrementBtn)
  expect(displayValue).toHaveTextContent('5')

  // Reset
  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  fireEvent.click(resetBtn)
  expect(displayValue).toHaveTextContent('0')

  // Undo via button
  const undoBtn = screen.getByRole('button', { name: /undo reset/i })
  expect(undoBtn).toBeInTheDocument()
  fireEvent.click(undoBtn)
  expect(displayValue).toHaveTextContent('5')
  expect(undoBtn).not.toBeInTheDocument()

  // Undo via shortcut
  fireEvent.click(resetBtn)
  expect(displayValue).toHaveTextContent('0')
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
  expect(displayValue).toHaveTextContent('5')
})

test('clears undo option on new interaction', () => {
  render(<App />)
  const incrementBtn = screen.getByRole('button', { name: /increment count/i })
  fireEvent.click(incrementBtn)

  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  fireEvent.click(resetBtn)
  expect(screen.queryByRole('button', { name: /undo reset/i })).toBeInTheDocument()

  // New increment should clear undo
  fireEvent.click(incrementBtn)
  expect(screen.queryByRole('button', { name: /undo reset/i })).not.toBeInTheDocument()
})
