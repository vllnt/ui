import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Command } from './command'

describe('Command', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Command>Test Content</Command>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Command className="custom-class">Test</Command>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<Command ref={ref}>Test</Command>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Command>Test</Command>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
