import type { Meta, StoryObj } from "@storybook/react-vite";

import { TableOfContentsPanel } from "./table-of-contents-panel";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

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
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: TableOfContentsPanel,
  title: "Utility/TableOfContentsPanel",
} satisfies Meta<typeof TableOfContentsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
