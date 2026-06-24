import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './components/Card'
import { Spinner } from './components/Spinner'
import { Tabs } from './components/Tabs'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Content inside card</p></Card>)
    expect(screen.getByText('Content inside card')).toBeInTheDocument()
  })

  it('renders with default styles', () => {
    render(<Card>Test</Card>)
    const card = screen.getByText('Test').closest('div')
    expect(card).toBeInTheDocument()
  })
})

describe('Spinner', () => {
  it('renders SVG spinner', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

describe('Tabs', () => {
  it('renders tab buttons', () => {
    const tabs = [{ id: 'paste', label: 'Paste' }, { id: 'upload', label: 'Upload' }]
    render(<Tabs tabs={tabs} activeTab="paste" onTabChange={() => {}} />)
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('calls onTabChange when tab clicked', () => {
    let changed = null
    const tabs = [{ id: 'paste', label: 'Paste' }, { id: 'upload', label: 'Upload' }]
    render(<Tabs tabs={tabs} activeTab="paste" onTabChange={(id) => { changed = id }} />)
    screen.getByText('Upload').click()
    expect(changed).toBe('upload')
  })
})
