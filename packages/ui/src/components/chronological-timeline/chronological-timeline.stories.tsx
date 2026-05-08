import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ChronoEvent,
  ChronologicalTimeline,
} from "./chronological-timeline";

const meta = {
  args: {
    title: "The Space Race",
  },
  component: ChronologicalTimeline,
  title: "Educational/ChronologicalTimeline",
} satisfies Meta<typeof ChronologicalTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ChronologicalTimeline {...args}>
      <ChronoEvent
        date="October 4, 1957"
        id="sputnik"
        subtitle="First artificial satellite"
        title="Sputnik 1"
      >
        <p>
          The Soviet Union launched Sputnik 1, the first artificial satellite,
          igniting the space age.
        </p>
        <blockquote>That ball in the sky changed everything.</blockquote>
      </ChronoEvent>
      <ChronoEvent
        date="April 12, 1961"
        id="vostok"
        subtitle="First human in space"
        title="Vostok 1"
      >
        <p>
          Yuri Gagarin orbited Earth aboard Vostok 1 in 108 minutes,
          becoming the first human in space.
        </p>
      </ChronoEvent>
      <ChronoEvent
        date="July 20, 1969"
        featured
        id="apollo"
        subtitle="First crewed Moon landing"
        title="Apollo 11"
      >
        <p>
          Neil Armstrong and Buzz Aldrin became the first humans to walk on
          the Moon. The crew returned safely on July 24.
        </p>
      </ChronoEvent>
    </ChronologicalTimeline>
  ),
};

export const WithImageMedia: Story = {
  args: { title: "Visual Storytelling" },
  render: (args) => (
    <ChronologicalTimeline {...args}>
      <ChronoEvent
        date="1957"
        id="sputnik-img"
        media={{
          alt: "Replica of the Sputnik 1 satellite",
          caption: "Replica on display at the National Air and Space Museum",
          credit: "NASA",
          src: "https://placehold.co/640x360/0d1117/ffffff/png?text=Sputnik+1",
          type: "image",
        }}
        title="Sputnik 1"
      >
        <p>
          A polished metal sphere with four trailing antennas — and the
          beep-beep-beep heard around the world.
        </p>
      </ChronoEvent>
    </ChronologicalTimeline>
  ),
};

export const Compact: Story = {
  args: { title: "Compact" },
  render: (args) => (
    <ChronologicalTimeline {...args}>
      <ChronoEvent date="1957" id="a" title="Sputnik 1" />
      <ChronoEvent date="1961" id="b" title="Vostok 1" />
      <ChronoEvent date="1969" id="c" title="Apollo 11" />
    </ChronologicalTimeline>
  ),
};

export const Untitled: Story = {
  args: { title: undefined },
  render: (args) => (
    <ChronologicalTimeline {...args}>
      <ChronoEvent date="1957" id="a" title="Sputnik 1">
        <p>The space age began.</p>
      </ChronoEvent>
      <ChronoEvent date="1969" featured id="b" title="Apollo 11">
        <p>Crewed lunar landing.</p>
      </ChronoEvent>
    </ChronologicalTimeline>
  ),
};
