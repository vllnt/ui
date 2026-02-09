import { expect, test } from '@playwright/experimental-ct-react'

import { Command } from './command'

test.describe('Command Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Command>Test</Command>)
    await expect(page).toHaveScreenshot('command-default.png')
  })
})
