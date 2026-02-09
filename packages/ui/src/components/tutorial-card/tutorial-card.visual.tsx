import { expect, test } from '@playwright/experimental-ct-react'

import { TutorialCard } from './tutorial-card'

test.describe('TutorialCard Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<TutorialCard />)
    await expect(page).toHaveScreenshot('tutorial-card-default.png')
  })
})
