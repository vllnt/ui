import { expect, test } from '@playwright/experimental-ct-react'

import { Popover } from './popover'

test.describe('Popover Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Popover></Popover>)
    await expect(page).toHaveScreenshot('popover-default.png')
  })
})
