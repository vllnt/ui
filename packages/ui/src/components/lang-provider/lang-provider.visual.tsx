import { expect, test } from '@playwright/experimental-ct-react'

import { LangProvider } from './lang-provider'

test.describe('LangProvider Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<LangProvider />)
    await expect(page).toHaveScreenshot('lang-provider-default.png')
  })
})
