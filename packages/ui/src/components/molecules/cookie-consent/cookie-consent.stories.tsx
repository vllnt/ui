import type { Meta, StoryObj } from "@storybook/react-vite";

import { CookieConsent } from "./cookie-consent";

const meta = {
  argTypes: {
    actions: {
      control: "select",
      options: ["accept-primary", "equal"],
    },
    layout: {
      control: "select",
      options: ["card", "bar"],
    },
  },
  component: CookieConsent,
  decorators: [
    (Story) => (
      <div className="relative h-48 [transform:translateZ(0)]">
        <Story />
      </div>
    ),
  ],
  title: "Utility/CookieConsent",
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: "Audience measurement",
  },
  name: "With title",
};

export const CustomLabels: Story = {
  args: {
    declineText: "Refuser",
    labels: {
      close: "Fermer",
      region: "Consentement aux cookies",
    },
    showCloseButton: true,
  },
  name: "Custom labels",
};

export const Bar: Story = {
  args: {
    declineText: "Decline",
    layout: "bar",
    settingsHref: "/privacy",
    settingsText: "Privacy",
  },
};

export const EqualActions: Story = {
  args: {
    actions: "equal",
    declineText: "Decline",
  },
  name: "Equal actions",
};

export const BarWithTitleAndEqualActions: Story = {
  args: {
    actions: "equal",
    declineText: "Decline",
    layout: "bar",
    message: "We measure audience with privacy-friendly analytics.",
    settingsHref: "/privacy",
    settingsText: "Privacy",
    title: "Audience measurement",
  },
  name: "Bar with title and equal actions",
};
