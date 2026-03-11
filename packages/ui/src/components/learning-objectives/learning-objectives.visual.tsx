import { expect, test } from '@playwright/experimental-ct-react'

import { LearningObjectives } from './learning-objectives'

test.describe('LearningObjectives Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<LearningObjectives>Test</LearningObjectives>)
    await expect(page).toHaveScreenshot('learning-objectives-default.png')
  })
})
