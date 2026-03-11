import { expect, test } from '@playwright/experimental-ct-react'

import { Tabs } from './tabs'

test.describe('Tabs Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Tabs>Test</Tabs>)
    await expect(page).toHaveScreenshot('tabs-default.png')
  })
})
