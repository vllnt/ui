import { expect, test } from '@playwright/experimental-ct-react'

import { CompletionDialog } from './completion-dialog'

test.describe('CompletionDialog Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<CompletionDialog></CompletionDialog>)
    await expect(page).toHaveScreenshot('completion-dialog-default.png')
  })
})
