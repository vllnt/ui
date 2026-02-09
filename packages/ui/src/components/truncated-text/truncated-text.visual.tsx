import { expect, test } from '@playwright/experimental-ct-react'

import { TruncatedText } from './truncated-text'

test.describe('TruncatedText Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<TruncatedText />)
    await expect(page).toHaveScreenshot('truncated-text-default.png')
  })
})
