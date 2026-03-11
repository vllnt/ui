import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Collapsible } from './collapsible'

describe('Collapsible', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Collapsible></Collapsible>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Collapsible className="custom-class"></Collapsible>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Collapsible></Collapsible>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
