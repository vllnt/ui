import { expect, test } from '@playwright/experimental-ct-react'

import { ModelSelector } from './model-selector'

test.describe('ModelSelector Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ModelSelector />)
    await expect(page).toHaveScreenshot('model-selector-default.png')
  })
})
