import { expect, test } from '@playwright/experimental-ct-react'

import { Exercise } from './exercise'

test.describe('Exercise Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Exercise>Test</Exercise>)
    await expect(page).toHaveScreenshot('exercise-default.png')
  })
})
