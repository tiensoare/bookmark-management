import { render, screen } from '@testing-library/react'
import Layout from '../src/components/Layout.jsx'
import { act } from 'react'

test('Layout renders children content', () => {
  act(() => {
    render(
      <Layout>
        <p>Inner content</p>
      </Layout>
    )
  })

  expect(screen.getByText('Inner content')).toBeInTheDocument()

  const elements = screen.getAllByText(/bookie/i)
  expect(elements[0]).toBeInTheDocument() // header
  expect(elements[1]).toBeInTheDocument() // footer
})