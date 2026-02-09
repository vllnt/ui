import { expect, test } from '@playwright/experimental-ct-react'

import { Switch } from './switch'

test.describe('Switch Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Switch />)
    await expect(page).toHaveScreenshot('switch-default.png')
  })
})
