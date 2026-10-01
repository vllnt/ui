// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta = {
  args: {
    children: (
      <>
        <HoverCardTrigger
          className="text-sm font-medium underline underline-offset-4"
          href="https://github.com/vllnt"
        >
          @vllnt
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <p className="text-sm font-semibold">vllnt</p>
          <p className="text-sm">
            Accessible React components built on Radix primitives.
          </p>
        </HoverCardContent>
      </>
    ),
    openDelay: 200,
  },
  component: HoverCard,
  parameters: {
    layout: "centered",
  },
  title: "Overlay/HoverCard",
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
