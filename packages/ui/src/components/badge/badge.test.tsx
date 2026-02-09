import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Badge>Test Content</Badge>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Badge className="custom-class">Test</Badge>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('variant variants', () => {
    it.each(['default', 'destructive', 'outline', 'secondary'] as const)(
      'renders %s variant',
      (variant) => {
        const { container } = render(<Badge variant={variant}>Test</Badge>)

        expect(container.firstChild).toBeInTheDocument()
      },
    )
  })

  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Badge>Test</Badge>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
