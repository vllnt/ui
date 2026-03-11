import { expect, test } from '@playwright/experimental-ct-react'

import { Sidebar } from './sidebar'

test.describe('Sidebar Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Sidebar></Sidebar>)
    await expect(page).toHaveScreenshot('sidebar-default.png')
  })
})
