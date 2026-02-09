import { expect, test } from '@playwright/experimental-ct-react'

import { FloatingActionButton } from './floating-action-button'

test.describe('FloatingActionButton Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<FloatingActionButton />)
    await expect(page).toHaveScreenshot('floating-action-button-default.png')
  })
})
