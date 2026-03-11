import { expect, test } from '@playwright/experimental-ct-react'

import { Slideshow } from './slideshow'

test.describe('Slideshow Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Slideshow></Slideshow>)
    await expect(page).toHaveScreenshot('slideshow-default.png')
  })
})
