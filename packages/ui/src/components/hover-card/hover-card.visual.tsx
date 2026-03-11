import { expect, test } from '@playwright/experimental-ct-react'

import { HoverCard } from './hover-card'

test.describe('HoverCard Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<HoverCard></HoverCard>)
    await expect(page).toHaveScreenshot('hover-card-default.png')
  })
})
