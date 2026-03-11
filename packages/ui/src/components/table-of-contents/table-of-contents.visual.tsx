import { expect, test } from '@playwright/experimental-ct-react'

import { TableOfContents } from './table-of-contents'

test.describe('TableOfContents Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<TableOfContents></TableOfContents>)
    await expect(page).toHaveScreenshot('table-of-contents-default.png')
  })
})
