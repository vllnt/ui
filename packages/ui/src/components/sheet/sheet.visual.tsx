import { expect, test } from '@playwright/experimental-ct-react'

import { Sheet } from './sheet'

test.describe('Sheet Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Sheet></Sheet>)
    await expect(page).toHaveScreenshot('sheet-default.png')
  })

  test('side-bottom', async ({ mount, page }) => {
    await mount(<Sheet side="bottom"></Sheet>)
    await expect(page).toHaveScreenshot('sheet-side-bottom.png')
  })

  test('side-left', async ({ mount, page }) => {
    await mount(<Sheet side="left"></Sheet>)
    await expect(page).toHaveScreenshot('sheet-side-left.png')
  })

  test('side-top', async ({ mount, page }) => {
    await mount(<Sheet side="top"></Sheet>)
    await expect(page).toHaveScreenshot('sheet-side-top.png')
  })
})
