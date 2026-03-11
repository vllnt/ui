import type { Meta, StoryObj } from "@storybook/react-vite";

import { TableOfContentsPanel } from "./table-of-contents-panel";

const meta = {
  args: {
    completedSections: new Set<string>(),
    completionCount: 0,
    currentSectionIndex: 0,
    isOpen: true,
    onClose: () => {},
    onSelectSection: () => {},
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "basics", title: "Basics" },
    ],
    totalSections: 2,
  },
  component: TableOfContentsPanel,
  title: "Utility/TableOfContentsPanel",
} satisfies Meta<typeof TableOfContentsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
