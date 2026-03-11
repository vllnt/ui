import { expect, test } from '@playwright/experimental-ct-react'

import { Terminal } from './terminal'

test.describe('Terminal Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Terminal></Terminal>)
    await expect(page).toHaveScreenshot('terminal-default.png')
  })
})
