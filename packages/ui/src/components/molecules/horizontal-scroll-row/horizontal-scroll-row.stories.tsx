// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { HorizontalScrollRow } from "./horizontal-scroll-row";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    children: (
      <>
        {["Intro", "Layout", "Forms", "Motion", "Data"].map((topic) => (
          <div
            className="w-40 shrink-0 rounded-lg border bg-card p-4 text-sm text-card-foreground"
            key={topic}
          >
            {topic}
          </div>
        ))}
      </>
    ),
    description: "Pick a topic to continue.",
    title: "Lessons",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: HorizontalScrollRow,
  title: "Navigation/HorizontalScrollRow",
} satisfies Meta<typeof HorizontalScrollRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = { args: { as: "h2" } };
