import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './components/Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Test</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
  })

  it('can be disabled', () => {
    render(<Button disabled>Test</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('calls onClick handler', () => {
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Test</Button>)
    screen.getByRole('button').click()
    expect(clicked).toBe(true)
  })
})
