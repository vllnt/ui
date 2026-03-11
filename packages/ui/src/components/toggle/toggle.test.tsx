import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Toggle } from './toggle'

describe('Toggle', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Toggle></Toggle>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Toggle className="custom-class"></Toggle>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('size variants', () => {
    it.each(['default', 'lg', 'sm'] as const)('renders %s size', (size) => {
      const { container } = render(<Toggle size={size}></Toggle>)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('variant variants', () => {
    it.each(['default', 'outline'] as const)('renders %s variant', (variant) => {
      const { container } = render(<Toggle variant={variant}></Toggle>)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<Toggle ref={ref}></Toggle>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Toggle></Toggle>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
