import { expect, test } from '@playwright/experimental-ct-react'

import { Spinner } from './spinner'

test.describe('Spinner Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Spinner></Spinner>)
    await expect(page).toHaveScreenshot('spinner-default.png')
  })
})
