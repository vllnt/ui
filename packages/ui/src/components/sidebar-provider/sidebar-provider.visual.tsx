import { expect, test } from '@playwright/experimental-ct-react'

import { SidebarProvider } from './sidebar-provider'

test.describe('SidebarProvider Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<SidebarProvider />)
    await expect(page).toHaveScreenshot('sidebar-provider-default.png')
  })
})
