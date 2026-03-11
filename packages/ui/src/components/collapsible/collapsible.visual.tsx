import { expect, test } from '@playwright/experimental-ct-react'

import { Collapsible } from './collapsible'

test.describe('Collapsible Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Collapsible></Collapsible>)
    await expect(page).toHaveScreenshot('collapsible-default.png')
  })
})
