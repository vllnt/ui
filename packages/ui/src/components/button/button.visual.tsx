import { expect, test } from '@playwright/experimental-ct-react'

import { Button } from './button'

test.describe('Button Visual', () => {
  test('default', async ({ mount, page }) => {
    await mount(<Button>Test</Button>)
    await expect(page).toHaveScreenshot('button-default.png')
  })

  test('size-icon', async ({ mount, page }) => {
    await mount(<Button size="icon">Test</Button>)
    await expect(page).toHaveScreenshot('button-size-icon.png')
  })

  test('size-lg', async ({ mount, page }) => {
    await mount(<Button size="lg">Test</Button>)
    await expect(page).toHaveScreenshot('button-size-lg.png')
  })

  test('size-sm', async ({ mount, page }) => {
    await mount(<Button size="sm">Test</Button>)
    await expect(page).toHaveScreenshot('button-size-sm.png')
  })

  test('variant-destructive', async ({ mount, page }) => {
    await mount(<Button variant="destructive">Test</Button>)
    await expect(page).toHaveScreenshot('button-variant-destructive.png')
  })

  test('variant-ghost', async ({ mount, page }) => {
    await mount(<Button variant="ghost">Test</Button>)
    await expect(page).toHaveScreenshot('button-variant-ghost.png')
  })

  test('variant-link', async ({ mount, page }) => {
    await mount(<Button variant="link">Test</Button>)
    await expect(page).toHaveScreenshot('button-variant-link.png')
  })

  test('variant-outline', async ({ mount, page }) => {
    await mount(<Button variant="outline">Test</Button>)
    await expect(page).toHaveScreenshot('button-variant-outline.png')
  })

  test('variant-secondary', async ({ mount, page }) => {
    await mount(<Button variant="secondary">Test</Button>)
    await expect(page).toHaveScreenshot('button-variant-secondary.png')
  })
})
