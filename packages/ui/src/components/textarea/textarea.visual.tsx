import { expect, test } from '@playwright/experimental-ct-react'

import { Textarea } from './textarea'

test.describe('Textarea Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Textarea></Textarea>)
    await expect(page).toHaveScreenshot('textarea-default.png')
  })
})
