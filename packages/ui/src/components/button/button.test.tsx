import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Button>Test Content</Button>)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>)

      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('size variants', () => {
    it.each(['default', 'icon', 'lg', 'sm'] as const)('renders %s size', (size) => {
      render(<Button size={size}>Test</Button>)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('variant variants', () => {
    it.each(['default', 'destructive', 'ghost', 'link', 'outline', 'secondary'] as const)(
      'renders %s variant',
      (variant) => {
        render(<Button variant={variant}>Test</Button>)

        expect(screen.getByRole('button')).toBeInTheDocument()
      },
    )
  })

  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<Button ref={ref}>Test</Button>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('has accessible button role', () => {
      render(<Button>Test</Button>)

      expect(screen.getByRole('button')).toBeVisible()
    })
  })
})
