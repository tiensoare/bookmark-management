import { render, screen } from '@testing-library/react'
import Home from '../src/components/Home.jsx'
import { act } from 'react'

test('Renders Home page content', () => {
  act(() => {
    render(<Home />)
  })

  // Pick something that definitely appears on your Home screen:
  // e.g. "Bookmark Manager", "Welcome", etc.
  // Update the text below to match your actual UI.
  expect(screen.getByText(/bookmark/i)).toBeInTheDocument()
})