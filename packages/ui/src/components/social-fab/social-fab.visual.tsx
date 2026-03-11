import { expect, test } from '@playwright/experimental-ct-react'

import { SocialFAB } from './social-fab'

test.describe('SocialFAB Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<SocialFAB></SocialFAB>)
    await expect(page).toHaveScreenshot('social-fab-default.png')
  })
})
