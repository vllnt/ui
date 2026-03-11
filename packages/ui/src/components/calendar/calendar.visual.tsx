import { expect, test } from '@playwright/experimental-ct-react'

import { Calendar } from './calendar'

test.describe('Calendar Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Calendar></Calendar>)
    await expect(page).toHaveScreenshot('calendar-default.png')
  })
})
