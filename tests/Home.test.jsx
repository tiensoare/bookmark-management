import { render, screen } from '@testing-library/react'
import Home from '../components/Home.jsx'  // adjust path/name if needed

test('renders home page content', () => {
  render(<Home />)

  // Pick something that definitely appears on your Home screen:
  // e.g. "Bookmark Manager", "Welcome", etc.
  // Update the text below to match your actual UI.
  expect(screen.getByText(/bookmark/i)).toBeInTheDocument()
})