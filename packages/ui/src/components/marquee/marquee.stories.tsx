import type { Meta, StoryObj } from "@storybook/react-vite";

import { Marquee } from "./marquee";

const meta = {
  args: {
    children: [
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
    ],
    className: "max-w-xl",
  },
  component: Marquee,
  title: "Utility/Marquee",
} satisfies Meta<typeof Marquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reverse: Story = {
  args: {
    reverse: true,
  },
};
