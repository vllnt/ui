import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type InteractiveTimelineEvent,
  InteractiveTimeline,
  InteractiveTimelineFilter,
  InteractiveTimelineToday,
  InteractiveTimelineToolbar,
  InteractiveTimelineZoomIn,
  InteractiveTimelineZoomOut,
} from "./interactive-timeline";

const TRACKS = [
  { color: "blue" as const, id: "release", label: "Releases" },
  { color: "red" as const, id: "incident", label: "Incidents" },
  { color: "emerald" as const, id: "feature", label: "Features" },
];

const CATEGORIES = [
  { color: "blue" as const, id: "release", label: "Release" },
  { color: "red" as const, id: "incident", label: "Incident" },
  { color: "emerald" as const, id: "feature", label: "Feature" },
];

const EVENTS: InteractiveTimelineEvent[] = [
  {
    category: "release",
    description: "Initial public release",
    id: "v1",
    startDate: new Date("2024-06-01"),
    title: "v1.0",
    track: "release",
  },
  {
    category: "release",
    description: "Major rewrite",
    id: "v2",
    startDate: new Date("2024-12-15"),
    title: "v2.0",
    track: "release",
  },
  {
    category: "incident",
    description: "API gateway 500s",
    endDate: new Date("2024-08-12"),
    id: "incident-1",
    startDate: new Date("2024-08-10"),
    title: "Outage",
    track: "incident",
  },
  {
    category: "feature",
    description: "Global search ships",
    endDate: new Date("2024-10-20"),
    id: "search",
    startDate: new Date("2024-09-01"),
    title: "Global search",
    track: "feature",
  },
];

const meta = {
  args: {
    categories: CATEGORIES,
    endDate: new Date("2025-01-01"),
    events: EVENTS,
    startDate: new Date("2024-01-01"),
    tracks: TRACKS,
  },
  component: InteractiveTimeline,
  title: "Timeline/InteractiveTimeline",
} satisfies Meta<typeof InteractiveTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InteractiveTimeline {...args}>
      <InteractiveTimelineToolbar>
        <InteractiveTimelineZoomIn />
        <InteractiveTimelineZoomOut />
        <InteractiveTimelineToday />
        <InteractiveTimelineFilter categories={CATEGORIES} />
      </InteractiveTimelineToolbar>
    </InteractiveTimeline>
  ),
};

export const NoToolbar: Story = {
  render: (args) => <InteractiveTimeline {...args} />,
};

export const SingleTrack: Story = {
  args: {
    events: EVENTS.filter((event) => event.track === "release"),
    tracks: [TRACKS[0]!],
  },
  render: (args) => (
    <InteractiveTimeline {...args}>
      <InteractiveTimelineToolbar>
        <InteractiveTimelineZoomIn />
        <InteractiveTimelineZoomOut />
      </InteractiveTimelineToolbar>
    </InteractiveTimeline>
  ),
};

export const TightWindow: Story = {
  args: {
    endDate: new Date("2024-09-30"),
    startDate: new Date("2024-08-01"),
  },
  render: (args) => (
    <InteractiveTimeline {...args}>
      <InteractiveTimelineToolbar>
        <InteractiveTimelineZoomIn />
        <InteractiveTimelineZoomOut />
      </InteractiveTimelineToolbar>
    </InteractiveTimeline>
  ),
};
