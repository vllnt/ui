import { expect, test } from '@playwright/experimental-ct-react'

import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help'

test.describe('KeyboardShortcutsHelp Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<KeyboardShortcutsHelp />)
    await expect(page).toHaveScreenshot('keyboard-shortcuts-help-default.png')
  })
})
