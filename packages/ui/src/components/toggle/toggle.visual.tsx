import { expect, test } from '@playwright/experimental-ct-react'

import { Toggle } from './toggle'

test.describe('Toggle Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Toggle></Toggle>)
    await expect(page).toHaveScreenshot('toggle-default.png')
  })

  test('size-lg', async ({ mount, page }) => {
    await mount(<Toggle size="lg"></Toggle>)
    await expect(page).toHaveScreenshot('toggle-size-lg.png')
  })

  test('size-sm', async ({ mount, page }) => {
    await mount(<Toggle size="sm"></Toggle>)
    await expect(page).toHaveScreenshot('toggle-size-sm.png')
  })

  test('variant-outline', async ({ mount, page }) => {
    await mount(<Toggle variant="outline"></Toggle>)
    await expect(page).toHaveScreenshot('toggle-variant-outline.png')
  })
})
