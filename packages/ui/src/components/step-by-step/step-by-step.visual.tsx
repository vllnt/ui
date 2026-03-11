import { expect, test } from '@playwright/experimental-ct-react'

import { StepByStep } from './step-by-step'

test.describe('StepByStep Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<StepByStep>Test</StepByStep>)
    await expect(page).toHaveScreenshot('step-by-step-default.png')
  })
})
