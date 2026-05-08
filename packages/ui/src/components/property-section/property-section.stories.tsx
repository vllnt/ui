import type { Meta, StoryObj } from "@storybook/react-vite";

import { type PropertyEntry, PropertySection } from "./property-section";

const ENTRIES: PropertyEntry[] = [
  { id: "x", label: "X", value: "120" },
  { id: "y", label: "Y", value: "80" },
  { id: "w", label: "Width", value: "240" },
  { id: "h", label: "Height", value: "120" },
];

const meta = {
  args: { entries: ENTRIES, title: "Layout" },
  component: PropertySection,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/PropertySection",
} satisfies Meta<typeof PropertySection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSublabels: Story = {
  args: {
    entries: ENTRIES.map((entry) => ({ ...entry, sublabel: "px" })),
  },
};

export const Collapsible: Story = { args: { collapsible: true } };

export const Untitled: Story = { args: { title: undefined } };
