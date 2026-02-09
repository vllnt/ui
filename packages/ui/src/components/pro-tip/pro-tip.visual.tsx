import { expect, test } from '@playwright/experimental-ct-react'

import { ProTip } from './pro-tip'

test.describe('ProTip Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ProTip>Test</ProTip>)
    await expect(page).toHaveScreenshot('pro-tip-default.png')
  })
})
