import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Pagination } from './pagination'

describe('Pagination', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Pagination />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Pagination className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Pagination />)

      expect(container.firstChild).toBeVisible()
    })
  })
})
