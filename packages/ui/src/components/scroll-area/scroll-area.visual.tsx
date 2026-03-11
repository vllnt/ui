import { expect, test } from '@playwright/experimental-ct-react'

import { ScrollArea } from './scroll-area'

test.describe('ScrollArea Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ScrollArea></ScrollArea>)
    await expect(page).toHaveScreenshot('scroll-area-default.png')
  })
})
