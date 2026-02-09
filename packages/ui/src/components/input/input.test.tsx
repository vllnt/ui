import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from './input'

describe('Input', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Input />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Input className="custom-class" />)

      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })
  describe('accessibility', () => {
    it('has accessible textbox role', () => {
      render(<Input />)

      expect(screen.getByRole('textbox')).toBeVisible()
    })
  })
})
