import { expect, test } from '@playwright/experimental-ct-react'

import { Badge } from './badge'

test.describe('Badge Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Badge>Test</Badge>)
    await expect(page).toHaveScreenshot('badge-default.png')
  })

  test('variant-destructive', async ({ mount, page }) => {
    await mount(<Badge variant="destructive">Test</Badge>)
    await expect(page).toHaveScreenshot('badge-variant-destructive.png')
  })

  test('variant-outline', async ({ mount, page }) => {
    await mount(<Badge variant="outline">Test</Badge>)
    await expect(page).toHaveScreenshot('badge-variant-outline.png')
  })

  test('variant-secondary', async ({ mount, page }) => {
    await mount(<Badge variant="secondary">Test</Badge>)
    await expect(page).toHaveScreenshot('badge-variant-secondary.png')
  })
})
