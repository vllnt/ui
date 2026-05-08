import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  PrimarySourceAnnotation,
  PrimarySourceAnnotations,
  PrimarySourceContext,
  PrimarySourceMetadata,
  PrimarySourceQuestions,
  PrimarySourceRotate,
  PrimarySourceToolbar,
  PrimarySourceTranscription,
  PrimarySourceViewer,
  PrimarySourceZoomIn,
  PrimarySourceZoomOut,
} from "./primary-source-viewer";

const SOURCE = {
  alt: "Historical document scan",
  src: "https://placehold.co/800x500/0d1117/d0d0d0/png?text=Primary+Source",
  type: "image" as const,
};

const meta = {
  args: {
    origin: "England",
    period: "Medieval",
    source: SOURCE,
    title: "Magna Carta (1215)",
  },
  component: PrimarySourceViewer,
  title: "Educational/PrimarySourceViewer",
} satisfies Meta<typeof PrimarySourceViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <PrimarySourceViewer {...args}>
      <PrimarySourceToolbar>
        <PrimarySourceZoomIn />
        <PrimarySourceZoomOut />
        <PrimarySourceRotate />
      </PrimarySourceToolbar>
      <PrimarySourceAnnotations>
        <PrimarySourceAnnotation
          category="Artifact"
          color="amber"
          id="seal"
          note="Royal seal of King John"
          region={{ height: 12, width: 28, x: 14, y: 60 }}
        />
        <PrimarySourceAnnotation
          category="Clause"
          color="blue"
          id="clause-39"
          note="Clause 39 — habeas corpus precursor"
          region={{ height: 10, width: 50, x: 30, y: 35 }}
        />
      </PrimarySourceAnnotations>
      <PrimarySourceTranscription>
        <p>John, by the grace of God, King of England, Lord of Ireland...</p>
        <p>
          No free man shall be seized, imprisoned, dispossessed, outlawed,
          exiled, or destroyed, except by the lawful judgment of his peers.
        </p>
      </PrimarySourceTranscription>
      <PrimarySourceContext>
        <PrimarySourceMetadata>
          <dt>Date</dt>
          <dd>June 15, 1215</dd>
          <dt>Location</dt>
          <dd>Runnymede, England</dd>
          <dt>Significance</dt>
          <dd>Foundation of constitutional law</dd>
        </PrimarySourceMetadata>
        <PrimarySourceQuestions>
          <p>1. What rights does this document establish?</p>
          <p>2. Why was it significant for its time?</p>
          <p>3. How does it influence modern constitutions?</p>
        </PrimarySourceQuestions>
      </PrimarySourceContext>
    </PrimarySourceViewer>
  ),
};

export const Minimal: Story = {
  args: { origin: undefined, period: undefined },
  render: (args) => (
    <PrimarySourceViewer {...args}>
      <PrimarySourceToolbar>
        <PrimarySourceZoomIn />
        <PrimarySourceZoomOut />
      </PrimarySourceToolbar>
    </PrimarySourceViewer>
  ),
};

export const NoTranscription: Story = {
  render: (args) => (
    <PrimarySourceViewer {...args}>
      <PrimarySourceToolbar>
        <PrimarySourceZoomIn />
        <PrimarySourceZoomOut />
        <PrimarySourceRotate />
      </PrimarySourceToolbar>
      <PrimarySourceAnnotations>
        <PrimarySourceAnnotation
          color="emerald"
          id="initial"
          note="Illuminated initial 'J'"
          region={{ height: 14, width: 12, x: 4, y: 8 }}
        />
      </PrimarySourceAnnotations>
    </PrimarySourceViewer>
  ),
};
