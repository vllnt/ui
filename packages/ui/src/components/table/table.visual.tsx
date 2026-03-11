import { expect, test } from '@playwright/experimental-ct-react'

import { Table } from './table'

test.describe('Table Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Table></Table>)
    await expect(page).toHaveScreenshot('table-default.png')
  })
})
