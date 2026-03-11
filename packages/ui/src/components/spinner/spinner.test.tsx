import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Spinner } from './spinner'

describe('Spinner', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Spinner></Spinner>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Spinner className="custom-class"></Spinner>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Spinner></Spinner>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
