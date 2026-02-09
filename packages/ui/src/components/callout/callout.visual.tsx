import { expect, test } from '@playwright/experimental-ct-react'

import { Callout } from './callout'

test.describe('Callout Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Callout>Test</Callout>)
    await expect(page).toHaveScreenshot('callout-default.png')
  })
})
