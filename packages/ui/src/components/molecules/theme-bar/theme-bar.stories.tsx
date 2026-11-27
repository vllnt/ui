import { SiteThemeProvider } from "../site-frame/site-frame";

import { ThemeBar } from "./theme-bar";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  args: {
    label: "Theme",
    options: { dark: "Dark", light: "Light", system: "System" },
  },
  component: ThemeBar,
  decorators: [
    (Story) => (
      <SiteThemeProvider>
        <Story />
      </SiteThemeProvider>
    ),
  ],
  title: "Layout/ThemeBar",
} satisfies Meta<typeof ThemeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OtherLanguage: Story = {
  args: {
    label: "Apparence",
    options: { dark: "Sombre", light: "Clair", system: "Système" },
  },
};
