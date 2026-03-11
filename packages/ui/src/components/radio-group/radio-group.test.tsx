import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RadioGroup } from './radio-group'

describe('RadioGroup', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<RadioGroup></RadioGroup>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<RadioGroup className="custom-class"></RadioGroup>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<RadioGroup ref={ref}></RadioGroup>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<RadioGroup></RadioGroup>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
