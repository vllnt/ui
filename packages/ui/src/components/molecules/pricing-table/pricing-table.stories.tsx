import type { Meta, StoryObj } from "@storybook/react-vite";

import { PricingPlan, PricingTable } from "./pricing-table";

const FREE_FEATURES = [
  { included: true, label: "5 projects" },
  { included: true, label: "1 GB storage" },
  { included: false, label: "API access" },
];

const PRO_FEATURES = [
  { included: true, label: "Unlimited projects" },
  { included: "100 GB", label: "Storage" },
  { included: true, label: "API access" },
];

const ENTERPRISE_FEATURES = [
  { included: true, label: "Everything in Pro" },
  { included: "Unlimited", label: "Storage" },
  { included: true, label: "SSO + audit logs" },
  { included: true, label: "Dedicated support" },
];

const meta = {
  args: {
    showPeriodToggle: false,
  },
  component: PricingTable,
  title: "Billing/PricingTable",
} satisfies Meta<typeof PricingTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <PricingTable {...args}>
      <PricingPlan
        cta={{ label: "Get started" }}
        description="For individuals"
        features={FREE_FEATURES}
        name="Free"
        period="/month"
        price="$0"
      />
      <PricingPlan
        badge="Most Popular"
        cta={{ label: "Start trial" }}
        description="For teams"
        features={PRO_FEATURES}
        highlighted
        name="Pro"
        period="/month"
        price="$29"
      />
      <PricingPlan
        cta={{ label: "Contact sales", variant: "outline" }}
        description="For organizations"
        features={ENTERPRISE_FEATURES}
        name="Enterprise"
        period=""
        price="Custom"
      />
    </PricingTable>
  ),
};

export const WithPeriodToggle: Story = {
  args: {
    periodLabels: { savings: "Save 20%" },
    showPeriodToggle: true,
  },
  render: (args) => (
    <PricingTable {...args}>
      <PricingPlan
        cta={{ label: "Get started" }}
        features={FREE_FEATURES}
        name="Free"
        period="/month"
        price="$0"
      />
      <PricingPlan
        badge="Most Popular"
        cta={{ label: "Start trial" }}
        features={PRO_FEATURES}
        highlighted
        name="Pro"
        period="/month"
        price="$29"
      />
    </PricingTable>
  ),
};

export const TwoColumn: Story = {
  render: (args) => (
    <PricingTable {...args}>
      <PricingPlan
        cta={{ label: "Get started" }}
        description="For individuals"
        features={FREE_FEATURES}
        name="Free"
        period="/month"
        price="$0"
      />
      <PricingPlan
        badge="Most Popular"
        cta={{ label: "Start trial" }}
        description="For teams"
        features={PRO_FEATURES}
        highlighted
        name="Pro"
        period="/month"
        price="$29"
      />
    </PricingTable>
  ),
};
