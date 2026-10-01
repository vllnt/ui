/**
 * Storybook stub for `next/image`: the default export renders a native `<img>`.
 *
 * Aliased via Vite resolve in main.ts (next/image -> ./next-image-stub.ts).
 */
import * as React from 'react'

function Image({
  src,
  alt,
  width,
  height,
  fill,
  ...props
}: {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  [key: string]: unknown
}) {
  const style = fill ? { objectFit: 'cover' as const, width: '100%', height: '100%' } : {}
  return React.createElement('img', {
    src: String(src),
    alt,
    width,
    height,
    style,
    ...props,
  })
}

export default Image
