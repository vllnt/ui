import { expect, test } from '@playwright/experimental-ct-react'

import { FilterBar } from './filter-bar'

test.describe('FilterBar Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<FilterBar />)
    await expect(page).toHaveScreenshot('filter-bar-default.png')
  })
})
