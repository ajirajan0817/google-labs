import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('increments and resets counter', () => {
  render(<App />)

  const incrementBtn = screen.getByRole('button', { name: /count is 0/i })
  const resetBtn = screen.getByRole('button', { name: /reset/i })

  fireEvent.click(incrementBtn)
  expect(incrementBtn).toHaveTextContent('Count is 1')

  fireEvent.click(resetBtn)
  expect(incrementBtn).toHaveTextContent('Count is 0')
})
