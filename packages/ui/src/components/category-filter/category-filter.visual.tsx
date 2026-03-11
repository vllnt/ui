import { expect, test } from '@playwright/experimental-ct-react'

import { CategoryFilter } from './category-filter'

test.describe('CategoryFilter Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<CategoryFilter></CategoryFilter>)
    await expect(page).toHaveScreenshot('category-filter-default.png')
  })
})
