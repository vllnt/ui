import type { Meta, StoryObj } from "@storybook/react-vite";

import { AutoReload } from "./auto-reload";

const meta = {
  args: {
    currency: "USD",
    defaultEnabled: false,
    defaultReloadAmountCents: 2000,
    defaultThresholdCents: 1000,
    locale: "en-US",
  },
  component: AutoReload,
  title: "Billing/AutoReload",
} satisfies Meta<typeof AutoReload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Enabled: Story = {
  args: {
    defaultEnabled: true,
  },
};

export const Euro: Story = {
  args: {
    currency: "EUR",
    defaultEnabled: true,
    locale: "en-IE",
  },
};

export const Saving: Story = {
  args: {
    defaultEnabled: true,
    isSaving: true,
  },
};

export const DisabledForUnsubscribed: Story = {
  args: {
    disabled: true,
    disabledMessage: "Subscribe to enable auto-reload settings.",
  },
  name: "Disabled (no subscription)",
};
