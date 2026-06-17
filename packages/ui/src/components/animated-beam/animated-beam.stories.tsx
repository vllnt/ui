import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { AnimatedBeam } from "./animated-beam";

const meta = {
  component: AnimatedBeam,
  title: "Effects/AnimatedBeam",
} satisfies Meta<typeof AnimatedBeam>;

export default meta;
type Story = StoryObj<typeof meta>;

function BeamDemo(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fromRef = React.useRef<HTMLDivElement>(null);
  const toRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-48 w-96 items-center justify-between rounded-xl border bg-card p-8"
      ref={containerRef}
    >
      <div
        className="z-10 flex size-12 items-center justify-center rounded-full border bg-background"
        ref={fromRef}
      >
        A
      </div>
      <div
        className="z-10 flex size-12 items-center justify-center rounded-full border bg-background"
        ref={toRef}
      >
        B
      </div>
      <AnimatedBeam containerRef={containerRef} fromRef={fromRef} toRef={toRef} />
    </div>
  );
}

export const Default: Story = {
  args: {
    containerRef: React.createRef<HTMLDivElement>(),
    fromRef: React.createRef<HTMLDivElement>(),
    toRef: React.createRef<HTMLDivElement>(),
  },
  render: () => <BeamDemo />,
};
