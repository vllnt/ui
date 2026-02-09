import { expect, test } from '@playwright/experimental-ct-react'

import { CookieConsent } from './cookie-consent'

// eslint-disable-next-line max-lines-per-function
test.describe('CookieConsent', () => {
  test('bottom-left position', async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-left"
      />,
    )
    await expect(component).toHaveScreenshot()
  })

  test('bottom-center position', async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-center"
      />,
    )
    await expect(component).toHaveScreenshot()
  })

  test('bottom-right position', async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-right"
      />,
    )
    await expect(component).toHaveScreenshot()
  })

  test('with decline button', async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        declineText="Decline"
        message="We use cookies"
        open={true}
        position="bottom-left"
      />,
    )
    await expect(component).toHaveScreenshot()
  })

  test('with settings link', async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-left"
        settingsHref="/privacy"
        settingsText="Learn more"
      />,
    )
    await expect(component).toHaveScreenshot()
  })

  test('with close button', async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-left"
        showCloseButton={true}
      />,
    )
    await expect(component).toHaveScreenshot()
  })
})
