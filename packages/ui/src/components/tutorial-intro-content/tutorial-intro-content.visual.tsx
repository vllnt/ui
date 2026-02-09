import { expect, test } from '@playwright/experimental-ct-react'

import { TutorialIntroContent } from './tutorial-intro-content'

test.describe('TutorialIntroContent Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<TutorialIntroContent />)
    await expect(page).toHaveScreenshot('tutorial-intro-content-default.png')
  })
})
