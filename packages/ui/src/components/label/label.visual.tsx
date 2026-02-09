import { expect, test } from '@playwright/experimental-ct-react'

import { Label } from './label'

test.describe('Label Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Label>Test</Label>)
    await expect(page).toHaveScreenshot('label-default.png')
  })
})
