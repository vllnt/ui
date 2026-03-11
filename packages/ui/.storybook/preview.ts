import { Renderer, definePreview } from '@storybook/react-vite'

import addonThemes, { withThemeByClassName } from '@storybook/addon-themes'

import '../styles.css'
import '../themes/default.css'

export default definePreview({
  addons: [addonThemes()],

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
