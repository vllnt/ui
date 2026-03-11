import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Skeleton></Skeleton>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class"></Skeleton>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Skeleton></Skeleton>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
