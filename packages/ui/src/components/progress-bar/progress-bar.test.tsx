import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressBar } from './progress-bar'

describe('ProgressBar', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<ProgressBar />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<ProgressBar className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<ProgressBar />)

      expect(container.firstChild).toBeVisible()
    })
  })
})
