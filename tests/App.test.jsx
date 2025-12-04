import { render, screen } from '@testing-library/react'
import App from '../src/App.jsx'
import { act } from 'react'

test('App shows main app UI', () => {
  act(() => {
    render(<App />)
  })
  // again, pick a stable bit of text
  expect(screen.getByText(/bookmark/i)).toBeInTheDocument()
})
