import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteFrame } from "./site-frame";

const meta = {
  args: {
    children: (
      <>
        <header className="border-b border-border p-4 text-sm">Header</header>
        <main className="p-4 text-sm" id="main">
          The page. Press Tab once to see the skip link above the header.
        </main>
      </>
    ),
    skipLabel: "Skip to content",
  },
  component: SiteFrame,
  title: "Layout/SiteFrame",
} satisfies Meta<typeof SiteFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
