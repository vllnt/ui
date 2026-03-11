import { expect, test } from '@playwright/experimental-ct-react'

import { TutorialComplete } from './tutorial-complete'

test.describe('TutorialComplete Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<TutorialComplete></TutorialComplete>)
    await expect(page).toHaveScreenshot('tutorial-complete-default.png')
  })
})
