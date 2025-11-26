import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

test('App shows main app UI', () => {
  render(<App />)
  // again, pick a stable bit of text
  expect(screen.getByText(/bookmark/i)).toBeInTheDocument()
})
