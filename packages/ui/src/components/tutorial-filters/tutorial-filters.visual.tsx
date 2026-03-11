import { expect, test } from '@playwright/experimental-ct-react'

import { TutorialFilters } from './tutorial-filters'

test.describe('TutorialFilters Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<TutorialFilters></TutorialFilters>)
    await expect(page).toHaveScreenshot('tutorial-filters-default.png')
  })
})
