import type { Meta, StoryObj } from "@storybook/react-vite";

import { NewsletterSignup } from "./newsletter-signup";

const SIMULATED_DELAY_MS = 800;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const meta = {
  args: {
    onSubmit: async () => sleep(SIMULATED_DELAY_MS),
    variant: "inline",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["inline", "stacked"],
    },
  },
  component: NewsletterSignup,
  title: "Forms/NewsletterSignup",
} satisfies Meta<typeof NewsletterSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Stacked: Story = {
  args: {
    variant: "stacked",
  },
};

export const ErrorState: Story = {
  args: {
    onSubmit: async () => {
      await sleep(SIMULATED_DELAY_MS);
      throw new Error("This email is already subscribed.");
    },
  },
  name: "Error state",
};

export const CustomLabels: Story = {
  args: {
    labels: {
      placeholder: "you@company.com",
      sending: "Joining…",
      submit: "Join the waitlist",
      success: "Welcome aboard. You'll hear from us soon.",
      tryAgain: "Retry",
    },
  },
  name: "Custom labels",
};

export const CorporateOnly: Story = {
  args: {
    validate: (email) =>
      email.endsWith("@example.com") ? true : "Corporate emails only.",
  },
  name: "Custom validator",
};
