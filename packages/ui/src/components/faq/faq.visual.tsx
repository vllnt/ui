import { expect, test } from '@playwright/experimental-ct-react'

import { FAQ } from './faq'

test.describe('FAQ Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<FAQ>Test</FAQ>)
    await expect(page).toHaveScreenshot('faq-default.png')
  })
})
