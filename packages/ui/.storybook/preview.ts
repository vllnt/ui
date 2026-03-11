import { Renderer, definePreview } from '@storybook/react-vite'

import addonDocs from '@storybook/addon-docs'
import addonPerformance from '@github-ui/storybook-addon-performance-panel'
import addonThemes, { withThemeByClassName } from '@storybook/addon-themes'

import '../styles.css'
import '../themes/default.css'
import './docs-overrides.css'

export default definePreview({
  addons: [addonDocs(), addonPerformance(), addonThemes()],

  decorators: [
    withThemeByClassName<Renderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
})
