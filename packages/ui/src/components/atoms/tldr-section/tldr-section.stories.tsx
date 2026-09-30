import type { Meta, StoryObj } from "@storybook/react-vite";

import { TLDRSection } from "./tldr-section";

const meta = {
  args: {
    children: "TldrSection",
  },
  component: TLDRSection,
  title: "Content/TldrSection",
} satisfies Meta<typeof TLDRSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
