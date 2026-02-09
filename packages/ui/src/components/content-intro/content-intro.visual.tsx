import { expect, test } from '@playwright/experimental-ct-react'

import { ContentIntro } from './content-intro'

test.describe('ContentIntro Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ContentIntro />)
    await expect(page).toHaveScreenshot('content-intro-default.png')
  })
})
