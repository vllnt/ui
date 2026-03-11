import { expect, test } from '@playwright/experimental-ct-react'

import { ContextMenu } from './context-menu'

test.describe('ContextMenu Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<ContextMenu></ContextMenu>)
    await expect(page).toHaveScreenshot('context-menu-default.png')
  })
})
