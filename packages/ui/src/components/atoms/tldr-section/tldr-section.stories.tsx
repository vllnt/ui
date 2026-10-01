// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { TLDRSection } from "./tldr-section";

const meta = {
  args: {
    children:
      "Radix primitives handle focus and keyboard behaviour; this library adds tokens, variants and composition.",
    label: "TL;DR",
  },
  component: TLDRSection,
  title: "Content/TldrSection",
} satisfies Meta<typeof TLDRSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
