import type { Meta, StoryObj } from "@storybook/react-vite";

import { StoryMap, StoryMapChapter } from "./story-map";

const meta = {
  component: StoryMap,
  title: "Educational/StoryMap",
} satisfies Meta<typeof StoryMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StoryMap>
      <StoryMapChapter
        center={[12.49, 41.89]}
        color="red"
        id="rome"
        subtitle="476 AD"
        title="The Fall of Rome"
        zoom={3}
      >
        <p>
          In 476 AD, the last Western Roman Emperor was deposed by the
          Germanic king Odoacer, conventionally marking the end of the
          Western Roman Empire.
        </p>
      </StoryMapChapter>
      <StoryMapChapter
        center={[28.98, 41.01]}
        color="purple"
        id="constantinople"
        subtitle="476 – 1453"
        title="Constantinople Endures"
        zoom={3}
      >
        <p>
          While Rome fell, Constantinople thrived as the capital of the
          Byzantine Empire for nearly a thousand more years, preserving
          much of Greek and Roman knowledge through the early Middle Ages.
        </p>
      </StoryMapChapter>
      <StoryMapChapter
        center={[36.2, 36.15]}
        color="amber"
        id="crusades"
        subtitle="1096 – 1291"
        title="The Crusades"
        zoom={3}
      >
        <p>
          Between 1096 and 1291, a series of religious wars launched by
          Western European Christians sought to recapture Jerusalem and
          other holy lands from Muslim rule.
        </p>
      </StoryMapChapter>
    </StoryMap>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <StoryMap>
      <StoryMapChapter
        center={[2.35, 48.85]}
        id="paris"
        media={{
          alt: "Paris from above",
          caption: "Paris, France",
          src: "https://placehold.co/640x360/0d1117/d0d0d0/png?text=Paris",
          type: "image",
        }}
        title="Paris"
        zoom={4}
      >
        <p>The Eiffel Tower opened to the public on May 6, 1889.</p>
      </StoryMapChapter>
      <StoryMapChapter
        center={[-0.13, 51.5]}
        id="london"
        media={{
          alt: "London from above",
          caption: "London, England",
          src: "https://placehold.co/640x360/0d1117/d0d0d0/png?text=London",
          type: "image",
        }}
        title="London"
        zoom={4}
      >
        <p>Big Ben rang out for the first time on May 31, 1859.</p>
      </StoryMapChapter>
    </StoryMap>
  ),
};

export const SingleChapter: Story = {
  render: () => (
    <StoryMap>
      <StoryMapChapter center={[2.35, 48.85]} id="paris" title="Paris" zoom={4}>
        <p>The Eiffel Tower opened to the public on May 6, 1889.</p>
      </StoryMapChapter>
    </StoryMap>
  ),
};
