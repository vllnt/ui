import { expect, test } from '@playwright/experimental-ct-react'

import { Quiz } from './quiz'

test.describe('Quiz Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Quiz>Test</Quiz>)
    await expect(page).toHaveScreenshot('quiz-default.png')
  })
})
