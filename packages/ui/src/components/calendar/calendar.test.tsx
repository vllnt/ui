import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Calendar } from './calendar'

describe('Calendar', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Calendar></Calendar>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Calendar className="custom-class"></Calendar>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Calendar></Calendar>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
