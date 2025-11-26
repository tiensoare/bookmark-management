import { render, screen } from '@testing-library/react'
import BookmarkList from '../components/BookmarkList.jsx' // adjust name as needed

test('renders a list of bookmarks', () => {
  const bookmarks = [
    { id: 1, title: 'VT', url: 'https://vt.edu' },
    { id: 2, title: 'GitHub', url: 'https://github.com' },
  ]

  render(<BookmarkList bookmarks={bookmarks} />)

  expect(screen.getByText('VT')).toBeInTheDocument()
  expect(screen.getByText('GitHub')).toBeInTheDocument()
})