import { expect, test } from '@playwright/experimental-ct-react'

import { ToggleGroup } from './toggle-group'

test.describe('ToggleGroup Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ToggleGroup></ToggleGroup>)
    await expect(page).toHaveScreenshot('toggle-group-default.png')
  })
})
