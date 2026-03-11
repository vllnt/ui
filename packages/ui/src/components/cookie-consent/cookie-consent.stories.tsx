import type { Meta, StoryObj } from "@storybook/react-vite";

import { CookieConsent } from "./cookie-consent";

const meta = {
  component: CookieConsent,
  title: "Components/CookieConsent",
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
