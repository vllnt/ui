import { expect, test } from '@playwright/experimental-ct-react'

import { Slider } from './slider'

test.describe('Slider Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Slider></Slider>)
    await expect(page).toHaveScreenshot('slider-default.png')
  })
})
