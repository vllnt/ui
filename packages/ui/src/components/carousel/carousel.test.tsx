import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Carousel } from './carousel'

describe('Carousel', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Carousel></Carousel>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Carousel className="custom-class"></Carousel>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })


  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<Carousel ref={ref}></Carousel>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<Carousel></Carousel>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
