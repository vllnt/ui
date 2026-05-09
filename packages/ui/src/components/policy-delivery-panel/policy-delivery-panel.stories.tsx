import type { Meta, StoryObj } from "@storybook/react-vite";

import { PolicyDeliveryPanel } from "./policy-delivery-panel";

const noop = (): void => undefined;

const meta = {
  args: {
    policies: [
      {
        id: "pii",
        name: "PII redaction",
        onToggle: noop,
        status: "enforced",
      },
      {
        description: "60 / s soft cap",
        id: "rate",
        name: "Rate limiting",
        onToggle: noop,
        status: "advisory",
      },
      {
        description: "rolled out 12 % of traffic",
        id: "exp",
        name: "Experiment B",
        onToggle: noop,
        status: "disabled",
      },
    ],
  },
  component: PolicyDeliveryPanel,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/PolicyDeliveryPanel",
} satisfies Meta<typeof PolicyDeliveryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { policies: [] },
};

export const AllEnforced: Story = {
  args: {
    policies: [
      { id: "pii", name: "PII redaction", status: "enforced" },
      { id: "tox", name: "Toxicity filter", status: "enforced" },
      { id: "rate", name: "Rate limiting", status: "enforced" },
    ],
  },
};

export const NonInteractive: Story = {
  args: {
    policies: [
      { id: "pii", name: "PII redaction", status: "enforced" },
      { id: "rate", name: "Rate limiting", status: "advisory" },
    ],
  },
};
