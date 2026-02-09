import { expect, test } from '@playwright/experimental-ct-react'

import { Checklist } from './checklist'

test.describe('Checklist Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Checklist>Test</Checklist>)
    await expect(page).toHaveScreenshot('checklist-default.png')
  })
})
