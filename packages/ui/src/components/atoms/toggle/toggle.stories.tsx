// manual
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold } from "lucide-react";

import { Toggle } from "./toggle";

const meta = {
  args: {
    "aria-label": "Toggle bold",
    children: <Bold aria-hidden="true" className="size-4" />,
    size: "default",
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "lg", "sm"],
    },
    variant: {
      control: "select",
      options: ["default", "outline", "unstyled"],
    },
  },
  component: Toggle,
  title: "Core/Toggle",
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeLg: Story = { args: { size: "lg" } };
export const SizeSm: Story = { args: { size: "sm" } };
export const VariantOutline: Story = { args: { variant: "outline" } };
/** No classes of its own: the toggle draws only what `className` gives it. */
export const VariantUnstyled: Story = {
  args: {
    className:
      "rounded-sm border border-dashed border-border px-2 py-1 text-foreground data-[state=on]:border-solid",
    variant: "unstyled",
  },
};
