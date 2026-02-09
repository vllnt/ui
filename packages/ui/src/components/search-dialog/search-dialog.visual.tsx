import { expect, test } from '@playwright/experimental-ct-react'

import { SearchDialog } from './search-dialog'

test.describe('SearchDialog Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<SearchDialog />)
    await expect(page).toHaveScreenshot('search-dialog-default.png')
  })
})
