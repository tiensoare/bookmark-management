// import { render, screen, within } from '@testing-library/react'
// import BookmarkTable from '../src/components/BookmarkTable.jsx'
// import { act } from 'react'

// test('Renders table headers and a bookmark row', () => {
//   const bookmarks = [
//     { id: 1, title: 'VT', url: 'https://vt.edu' },
//   ]

//   act(() => {
//     render(<BookmarkTable bookmarks={bookmarks} />)
//   })

//   // Check headers (adjust to your real text: "Title", "URL", etc.)
//   expect(screen.getByText(/title/i)).toBeInTheDocument()
//   expect(screen.getByText(/url/i)).toBeInTheDocument()

//   // Check that a row with VT exists
//   const row = screen.getByText('VT').closest('tr')
//   expect(row).not.toBeNull()
//   expect(within(row).getByText('https://vt.edu')).toBeInTheDocument()
// })


import { render, screen, within } from '@testing-library/react'
import BookmarkTable from '../src/components/BookmarkTable.jsx'

test('Renders table headers and a bookmark row', async () => {
  const bookmarks = [
    { 
      id: 1, 
      title: 'VT', 
      url: 'https://vt.edu', 
      notes: '',
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    },
  ]

  render(<BookmarkTable initialBookmarks={bookmarks} />)

  // Get the table element
  const table = screen.getByRole('table')

  // Check headers only within the table
  const header = within(table).getByText(/title/i)
  expect(header).toBeInTheDocument()
  expect(within(table).getByText(/url/i)).toBeInTheDocument()

  // Check that the bookmark row is rendered
  const row = within(table).getByText('VT').closest('tr')
  expect(row).not.toBeNull()
  expect(within(row).getByText('https://vt.edu')).toBeInTheDocument()
})
