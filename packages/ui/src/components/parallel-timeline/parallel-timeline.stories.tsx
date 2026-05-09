import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ParallelTimeline,
  type ParallelTimelineTrack,
} from "./parallel-timeline";

const TRACKS: ParallelTimelineTrack[] = [
  {
    color: "red",
    events: [
      { id: "augustus", title: "Augustus becomes Emperor", year: -27 },
      { id: "trajan", title: "Trajan's peak", year: 117 },
      { id: "fall", title: "Fall of Western Rome", year: 476 },
    ],
    id: "rome",
    name: "Rome",
    region: "Mediterranean",
  },
  {
    color: "amber",
    events: [
      { id: "qin", title: "Qin unifies China", year: -221 },
      { id: "han-start", title: "Han dynasty begins", year: -202 },
      { id: "han-end", title: "End of Han", year: 220 },
    ],
    id: "china",
    name: "China",
    region: "East Asia",
  },
  {
    color: "emerald",
    events: [
      { id: "maurya", title: "Maurya Empire founded", year: -322 },
      { id: "ashoka", title: "Ashoka the Great", year: -250 },
      { id: "gupta", title: "Gupta Empire begins", year: 320 },
    ],
    id: "india",
    name: "India",
    region: "South Asia",
  },
];

const meta = {
  args: {
    endYear: 500,
    startYear: -500,
    tracks: TRACKS,
  },
  component: ParallelTimeline,
  title: "Educational/ParallelTimeline",
} satisfies Meta<typeof ParallelTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithEra: Story = {
  args: {
    eras: [
      {
        color: "neutral",
        end: 500,
        id: "antiquity",
        name: "Antiquity",
        start: -500,
      },
    ],
  },
};

export const TwoTracks: Story = {
  args: {
    tracks: TRACKS.slice(0, 2),
  },
};

export const TightWindow: Story = {
  args: {
    endYear: 500,
    startYear: -300,
  },
};
