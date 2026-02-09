import { expect, test } from '@playwright/experimental-ct-react'

import { ThemeToggle } from './theme-toggle'

test.describe('ThemeToggle Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ThemeToggle />)
    await expect(page).toHaveScreenshot('theme-toggle-default.png')
  })
})
