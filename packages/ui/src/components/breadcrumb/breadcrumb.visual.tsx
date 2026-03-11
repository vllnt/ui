import { expect, test } from '@playwright/experimental-ct-react'

import { Breadcrumb } from './breadcrumb'

test.describe('Breadcrumb Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Breadcrumb></Breadcrumb>)
    await expect(page).toHaveScreenshot('breadcrumb-default.png')
  })
})
