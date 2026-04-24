import type { Meta, StoryObj } from "@storybook/react-vite";

import { Marquee } from "./marquee";

const ITEMS = [
  <span className="rounded-md border bg-muted px-3 py-2 text-sm" key="alpha">
    Alpha
  </span>,
  <span className="rounded-md border bg-muted px-3 py-2 text-sm" key="beta">
    Beta
  </span>,
  <span className="rounded-md border bg-muted px-3 py-2 text-sm" key="gamma">
    Gamma
  </span>,
  <span className="rounded-md border bg-muted px-3 py-2 text-sm" key="delta">
    Delta
  </span>,
];

const meta = {
  args: {
    children: ITEMS,
    className: "max-w-xl",
    speed: "normal",
  },
  component: Marquee,
  title: "Utility/Marquee",
} satisfies Meta<typeof Marquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slow: Story = {
  args: {
    speed: "slow",
  },
};

export const Fast: Story = {
  args: {
    speed: "fast",
  },
};

export const CustomDuration: Story = {
  args: {
    duration: 14,
  },
};

export const Reverse: Story = {
  args: {
    reverse: true,
  },
};
