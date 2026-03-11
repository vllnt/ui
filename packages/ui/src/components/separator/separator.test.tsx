import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Separator></Separator>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Separator className="custom-class"></Separator>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<Separator ref={ref}></Separator>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Separator></Separator>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
