import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
  args: {
    children: "Badge",
    variant: "default",
  },
  argTypes: {
    border: {
      control: "select",
      options: ["none", "strong"],
    },
    dot: { control: "boolean" },
    size: {
      control: "select",
      options: ["default", "header", "inline", "sm"],
    },
    tone: {
      control: "select",
      options: [
        "neutral",
        "primary",
        "solid",
        "info",
        "success",
        "warning",
        "danger",
        "danger-tint",
        "danger-solid",
      ],
    },
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "soft"],
    },
  },
  component: Badge,
  title: "Core/Badge",
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantDestructive: Story = { args: { variant: "destructive" } };
export const VariantOutline: Story = { args: { variant: "outline" } };
export const VariantSecondary: Story = { args: { variant: "secondary" } };
export const VariantSoft: Story = { args: { variant: "soft" } };

export const WithDot: Story = {
  args: { children: "Active", dot: true, tone: "success", variant: "secondary" },
};

export const Tones: Story = {
  args: { variant: "secondary" },
  render: (arguments_) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...arguments_} dot tone="neutral">
        Neutral
      </Badge>
      <Badge {...arguments_} dot tone="primary">
        Primary
      </Badge>
      <Badge {...arguments_} dot tone="info">
        Info
      </Badge>
      <Badge {...arguments_} dot tone="success">
        Success
      </Badge>
      <Badge {...arguments_} dot tone="warning">
        Warning
      </Badge>
      <Badge {...arguments_} dot tone="danger">
        Danger
      </Badge>
      <Badge {...arguments_} dot tone="solid">
        Solid
      </Badge>
      <Badge {...arguments_} dot tone="danger-tint">
        Danger tint
      </Badge>
      <Badge {...arguments_} dot tone="danger-solid">
        Danger solid
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  args: { dot: true, tone: "success", variant: "secondary" },
  render: (arguments_) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...arguments_} size="header">
        Header
      </Badge>
      <Badge {...arguments_} size="default">
        Default
      </Badge>
      <Badge {...arguments_} size="sm">
        Small
      </Badge>
      <p className="text-sm">
        Running text with an <Badge {...arguments_} size="inline">inline</Badge>{" "}
        chip.
      </p>
    </div>
  ),
};

export const Borders: Story = {
  args: { dot: true, tone: "info", variant: "secondary" },
  render: (arguments_) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...arguments_} border="none">
        No border
      </Badge>
      <Badge {...arguments_} border="strong">
        Strong border
      </Badge>
    </div>
  ),
};
