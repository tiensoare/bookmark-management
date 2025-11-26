import { render, screen, within } from '@testing-library/react'
import BookmarkTable from '../components/BookmarkTable.jsx' // adjust name

test('renders table headers and a bookmark row', () => {
  const bookmarks = [
    { id: 1, title: 'VT', url: 'https://vt.edu' },
  ]

  render(<BookmarkTable bookmarks={bookmarks} />)

  // Check headers (adjust to your real text: "Title", "URL", etc.)
  expect(screen.getByText(/title/i)).toBeInTheDocument()
  expect(screen.getByText(/url/i)).toBeInTheDocument()

  // Check that a row with VT exists
  const row = screen.getByText('VT').closest('tr')
  expect(row).not.toBeNull()
  expect(within(row).getByText('https://vt.edu')).toBeInTheDocument()
})