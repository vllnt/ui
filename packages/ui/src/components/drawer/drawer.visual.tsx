import { expect, test } from '@playwright/experimental-ct-react'

import { Drawer } from './drawer'

test.describe('Drawer Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Drawer></Drawer>)
    await expect(page).toHaveScreenshot('drawer-default.png')
  })
})
