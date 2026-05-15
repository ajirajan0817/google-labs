import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('increments and resets counter', () => {
  render(<App />)

  const incrementBtn = screen.getByRole('button', { name: /increment count. current count is 0/i })
  const resetBtn = screen.getByRole('button', { name: /reset count/i })

  // Check initial state
  expect(incrementBtn).toHaveTextContent('Count is 0')
  expect(resetBtn).toBeDisabled()

  // Increment
  fireEvent.click(incrementBtn)
  expect(incrementBtn).toHaveTextContent('Count is 1')
  expect(incrementBtn).toHaveAttribute('aria-label', 'Increment count. Current count is 1')
  expect(resetBtn).not.toBeDisabled()

  // Reset
  fireEvent.click(resetBtn)
  expect(incrementBtn).toHaveTextContent('Count is 0')
  expect(incrementBtn).toHaveAttribute('aria-label', 'Increment count. Current count is 0')
  expect(resetBtn).toBeDisabled()
})

test('updates document title with current count', () => {
  render(<App />)
  expect(document.title).toBe('Count: 0 | Palette Counter')

  const incrementBtn = screen.getByRole('button', { name: /increment count. current count is 0/i })
  fireEvent.click(incrementBtn)
  expect(document.title).toBe('Count: 1 | Palette Counter')

  const resetBtn = screen.getByRole('button', { name: /reset count/i })
  fireEvent.click(resetBtn)
  expect(document.title).toBe('Count: 0 | Palette Counter')
})
