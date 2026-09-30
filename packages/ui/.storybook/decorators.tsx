import type { Decorator } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

/** Story decorator that renders the story inside a plain `<div>` layout wrapper. */
export const withWrapper =
  (className?: string, style?: CSSProperties): Decorator =>
  (Story) => (
    <div className={className} style={style}>
      <Story />
    </div>
  )
