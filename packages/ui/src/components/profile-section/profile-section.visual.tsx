import { expect, test } from '@playwright/experimental-ct-react'

import { ProfileSection } from './profile-section'

test.describe('ProfileSection Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ProfileSection></ProfileSection>)
    await expect(page).toHaveScreenshot('profile-section-default.png')
  })
})
