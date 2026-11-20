import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrderSummary } from "./order-summary";

const noop = (): undefined => undefined;

function OrderSummaryDemo({
  promo,
  ...props
}: React.ComponentProps<typeof OrderSummary>): React.JSX.Element {
  const [value, setValue] = React.useState(promo?.value ?? "");

  return (
    <div className="w-full max-w-md">
      <OrderSummary
        {...props}
        promo={promo ? { ...promo, onValueChange: setValue, value } : undefined}
      />
    </div>
  );
}

const meta = {
  args: {
    lines: [
      { label: "Subtotal", value: "$120.00" },
      { label: "Shipping", value: "$8.00" },
      { label: "Tax", value: "$10.24" },
    ],
    promo: { onApply: noop, onValueChange: noop, value: "" },
    title: "Order summary",
    total: { label: "Total", value: "$138.24" },
  },
  argTypes: {
    checkoutLoading: { control: "boolean" },
    layout: {
      control: "select",
      options: ["desktop", "phone"],
    },
  },
  component: OrderSummary,
  render: (args) => <OrderSummaryDemo {...args} />,
  title: "Account & Billing/OrderSummary",
} satisfies Meta<typeof OrderSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Phone: Story = {
  args: { layout: "phone" },
};

export const WithoutPromo: Story = {
  args: { promo: undefined },
};

export const PromoApplying: Story = {
  args: {
    promo: {
      labels: { apply: "Applying" },
      onApply: noop,
      onValueChange: noop,
      status: "applying",
      value: "SAVE10",
    },
  },
};

export const PromoError: Story = {
  args: {
    promo: {
      hint: "This code has expired.",
      onApply: noop,
      onValueChange: noop,
      status: "error",
      value: "OLD10",
    },
  },
};

export const CheckoutLoading: Story = {
  args: { checkoutLoading: true },
};
