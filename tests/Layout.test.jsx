import { render, screen } from '@testing-library/react'
import { Layout } from '../components/Layout.jsx'

test('Layout renders children content', () => {
  render(
    <Layout>
      <p>Inner content</p>
    </Layout>
  )

  expect(screen.getByText('Inner content')).toBeInTheDocument()

  expect(screen.getByText(/bookmark management/i)).toBeInTheDocument()
})