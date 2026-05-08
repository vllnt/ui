import type { Meta, StoryObj } from "@storybook/react-vite";

import { Timeline, TimelineItem } from "./timeline";

const meta = {
  args: {
    orientation: "vertical",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
    },
  },
  component: Timeline,
  title: "Content/Timeline",
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem
        date="Jan 2026"
        description="Initial planning and team formation."
        status="completed"
        title="Project started"
      />
      <TimelineItem
        date="Mar 2026"
        description="First version shipped to beta users."
        status="completed"
        title="MVP launch"
      />
      <TimelineItem
        date="Jul 2026"
        description="Major redesign with new features."
        status="active"
        title="V2 release"
      />
      <TimelineItem
        date="Q4 2026"
        description="General availability."
        isLast
        status="upcoming"
        title="Public release"
      />
    </Timeline>
  ),
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem date="Jan" status="completed" title="Plan" />
      <TimelineItem date="Mar" status="completed" title="Build" />
      <TimelineItem date="Jul" status="active" title="Test" />
      <TimelineItem date="Oct" isLast status="upcoming" title="Ship" />
    </Timeline>
  ),
};

export const WithRichContent: Story = {
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem
        date="Jan 2026"
        description="Kicked off with a small core team."
        status="completed"
        title="Project started"
      >
        <ul className="list-disc pl-4 text-sm text-muted-foreground">
          <li>Hired the founding designer</li>
          <li>Locked the v1 scope</li>
        </ul>
      </TimelineItem>
      <TimelineItem
        date="Mar 2026"
        description="Closed the design loop with the engineering team."
        isLast
        status="active"
        title="Beta opens"
      />
    </Timeline>
  ),
};

export const ColorOverrides: Story = {
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem color="emerald" status="completed" title="Discovery" />
      <TimelineItem color="amber" status="completed" title="Design" />
      <TimelineItem color="purple" status="active" title="Build" />
      <TimelineItem
        color="rose"
        isLast
        status="upcoming"
        title="Launch"
      />
    </Timeline>
  ),
};
