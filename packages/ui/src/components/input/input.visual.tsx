import { expect, test } from '@playwright/experimental-ct-react'

import { Input } from './input'

test.describe('Input Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Input />)
    await expect(page).toHaveScreenshot('input-default.png')
  })
})
