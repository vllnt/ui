import type { Meta, StoryObj } from "@storybook/react-vite";

import { ApprovalRequest } from "./approval-request";

const meta = {
  args: {
    action: "pnpm db:migrate --env production",
    detail: "The agent wants to apply 3 pending migrations to the database.",
    onApprove: () => {},
    onDeny: () => {},
    placement: "inline",
    remember: { label: "Always allow this command in this workspace" },
    risk: "medium",
    status: "pending",
    title: "Run database migration",
  },
  argTypes: {
    placement: {
      control: "select",
      options: ["inline", "hud", "dialog"],
    },
    risk: {
      control: "select",
      options: ["low", "medium", "high"],
    },
    status: {
      control: "select",
      options: ["pending", "approved", "denied", "expired"],
    },
  },
  component: ApprovalRequest,
  title: "AI/ApprovalRequest",
} satisfies Meta<typeof ApprovalRequest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LowRisk: Story = {
  args: {
    action: "git status --short",
    detail: "Reads the working tree. Nothing is changed.",
    risk: "low",
    title: "Read repository status",
  },
};

export const HighRisk: Story = {
  args: {
    action: "rm -rf ./dist ./node_modules/.cache",
    detail: "Deletes build output and caches. This cannot be undone.",
    risk: "high",
    title: "Delete build output",
  },
};

export const Approved: Story = {
  args: {
    status: "approved",
  },
};

export const Denied: Story = {
  args: {
    risk: "high",
    status: "denied",
  },
};

export const Expired: Story = {
  args: {
    status: "expired",
  },
};

export const WithoutRemember: Story = {
  args: {
    remember: undefined,
  },
};

export const Hud: Story = {
  args: {
    placement: "hud",
  },
};

export const Dialog: Story = {
  args: {
    placement: "dialog",
  },
};

export const CustomLabels: Story = {
  args: {
    labels: {
      approve: "Autoriser",
      deny: "Refuser",
      risk: { medium: "Risque moyen" },
      status: { pending: "En attente" },
    },
    remember: { label: "Toujours autoriser cette commande" },
  },
};
