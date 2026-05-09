import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  MapTimeline,
  MapTimelineControls,
  MapTimelineEvent,
  MapTimelineLayer,
  MapTimelinePlayButton,
  MapTimelineSlider,
} from "./map-timeline";

const ROMAN_RING: [number, number][] = [
  [-9, 56],
  [10, 56],
  [40, 50],
  [40, 30],
  [10, 30],
  [-9, 36],
  [-9, 56],
];

const BYZANTINE_RING: [number, number][] = [
  [10, 45],
  [42, 45],
  [42, 30],
  [10, 30],
  [10, 45],
];

const HOLY_ROMAN_RING: [number, number][] = [
  [4, 55],
  [18, 55],
  [18, 45],
  [4, 45],
  [4, 55],
];

const meta = {
  args: {
    endYear: 2025,
    initialYear: 400,
    startYear: -500,
  },
  component: MapTimeline,
  title: "Educational/MapTimeline",
} satisfies Meta<typeof MapTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <MapTimeline {...args}>
      <MapTimelineLayer
        color="red"
        endYear={476}
        geometry={{ polygon: ROMAN_RING, type: "polygon" }}
        id="rome"
        label="Roman Empire"
        startYear={-27}
      />
      <MapTimelineLayer
        color="purple"
        endYear={1453}
        geometry={{ polygon: BYZANTINE_RING, type: "polygon" }}
        id="byzantium"
        label="Byzantine Empire"
        startYear={330}
      />
      <MapTimelineLayer
        color="emerald"
        endYear={1806}
        geometry={{ polygon: HOLY_ROMAN_RING, type: "polygon" }}
        id="holy-roman"
        label="Holy Roman Empire"
        startYear={800}
      />
      <MapTimelineEvent
        color="amber"
        description="Pompeii destroyed"
        id="vesuvius"
        position={[14.48, 40.75]}
        title="Vesuvius"
        toleranceYears={400}
        year={79}
      />
      <MapTimelineControls>
        <MapTimelinePlayButton />
        <MapTimelineSlider />
      </MapTimelineControls>
    </MapTimeline>
  ),
};

export const RomanEra: Story = {
  args: { endYear: 600, initialYear: 100, startYear: -200 },
  render: (args) => (
    <MapTimeline {...args}>
      <MapTimelineLayer
        color="red"
        endYear={476}
        geometry={{ polygon: ROMAN_RING, type: "polygon" }}
        id="rome"
        label="Roman Empire"
        startYear={-27}
      />
      <MapTimelineEvent
        color="amber"
        description="Pompeii destroyed"
        id="vesuvius"
        position={[14.48, 40.75]}
        title="Vesuvius"
        toleranceYears={3}
        year={79}
      />
      <MapTimelineControls>
        <MapTimelinePlayButton />
        <MapTimelineSlider />
      </MapTimelineControls>
    </MapTimeline>
  ),
};

export const NoControls: Story = {
  args: { initialYear: 800 },
  render: (args) => (
    <MapTimeline {...args}>
      <MapTimelineLayer
        color="purple"
        endYear={1453}
        geometry={{ polygon: BYZANTINE_RING, type: "polygon" }}
        id="byzantium"
        label="Byzantine Empire"
        startYear={330}
      />
    </MapTimeline>
  ),
};
