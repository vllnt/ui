import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SidebarToggle } from './sidebar-toggle'

describe('SidebarToggle', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<SidebarToggle />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<SidebarToggle className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<SidebarToggle />)

      expect(container.firstChild).toBeVisible()
    })
  })
})
