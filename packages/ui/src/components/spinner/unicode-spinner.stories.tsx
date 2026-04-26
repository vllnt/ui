import type { Meta, StoryObj } from "@storybook/react-vite";

import { UnicodeSpinner, UNICODE_SPINNER_ANIMATIONS } from "./unicode-spinner";

const meta = {
  args: {
    animation: "braille",
  },
  component: UnicodeSpinner,
  title: "Utility/UnicodeSpinner",
} satisfies Meta<typeof UnicodeSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

function SpinnerTile({ animation }: { animation: (typeof UNICODE_SPINNER_ANIMATIONS)[number] }) {
  return (
    <div className="flex min-h-16 items-center justify-between rounded-md border border-border bg-background px-4 py-3">
      <span className="text-sm font-medium text-foreground">
        {animation.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ")}
      </span>
      <div className="flex min-w-24 items-center justify-center">
        <UnicodeSpinner animation={animation} />
      </div>
    </div>
  );
}

export const AllAnimations: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {UNICODE_SPINNER_ANIMATIONS.map((animation) => (
        <SpinnerTile animation={animation} key={animation} />
      ))}
    </div>
  ),
};

export const Arc: Story = {
  args: {
    animation: "arc",
    label: "Arc",
  },
};

export const Arrow: Story = {
  args: {
    animation: "arrow",
    label: "Arrow",
  },
};

export const Balloon: Story = {
  args: {
    animation: "balloon",
    label: "Balloon",
  },
};

export const Bounce: Story = {
  args: {
    animation: "bounce",
    label: "Bounce",
  },
};

export const Braille: Story = {
  args: {
    animation: "braille",
    label: "Braille",
  },
};

export const Braillewave: Story = {
  args: {
    animation: "braillewave",
    label: "Braillewave",
  },
};

export const Breathe: Story = {
  args: {
    animation: "breathe",
    label: "Breathe",
  },
};

export const Cascade: Story = {
  args: {
    animation: "cascade",
    label: "Cascade",
  },
};

export const Checkerboard: Story = {
  args: {
    animation: "checkerboard",
    label: "Checkerboard",
  },
};

export const CircleHalves: Story = {
  args: {
    animation: "circle-halves",
    label: "Circle Halves",
  },
};

export const CircleQuarters: Story = {
  args: {
    animation: "circle-quarters",
    label: "Circle Quarters",
  },
};

export const Clock: Story = {
  args: {
    animation: "clock",
    label: "Clock",
  },
};

export const Columns: Story = {
  args: {
    animation: "columns",
    label: "Columns",
  },
};

export const Diagswipe: Story = {
  args: {
    animation: "diagswipe",
    label: "Diagswipe",
  },
};

export const Dna: Story = {
  args: {
    animation: "dna",
    label: "Dna",
  },
};

export const Dots: Story = {
  args: {
    animation: "dots",
    label: "Dots",
  },
};

export const Dots2: Story = {
  args: {
    animation: "dots2",
    label: "Dots2",
  },
};

export const Dots3: Story = {
  args: {
    animation: "dots3",
    label: "Dots3",
  },
};

export const Dots4: Story = {
  args: {
    animation: "dots4",
    label: "Dots4",
  },
};

export const Dots5: Story = {
  args: {
    animation: "dots5",
    label: "Dots5",
  },
};

export const Dots6: Story = {
  args: {
    animation: "dots6",
    label: "Dots6",
  },
};

export const Dots7: Story = {
  args: {
    animation: "dots7",
    label: "Dots7",
  },
};

export const Dots8: Story = {
  args: {
    animation: "dots8",
    label: "Dots8",
  },
};

export const Dots9: Story = {
  args: {
    animation: "dots9",
    label: "Dots9",
  },
};

export const Dots10: Story = {
  args: {
    animation: "dots10",
    label: "Dots10",
  },
};

export const Dots11: Story = {
  args: {
    animation: "dots11",
    label: "Dots11",
  },
};

export const Dots12: Story = {
  args: {
    animation: "dots12",
    label: "Dots12",
  },
};

export const Dots13: Story = {
  args: {
    animation: "dots13",
    label: "Dots13",
  },
};

export const Dots14: Story = {
  args: {
    animation: "dots14",
    label: "Dots14",
  },
};

export const DotsCircle: Story = {
  args: {
    animation: "dots-circle",
    label: "Dots Circle",
  },
};

export const DoubleArrow: Story = {
  args: {
    animation: "double-arrow",
    label: "Double Arrow",
  },
};

export const Dqpb: Story = {
  args: {
    animation: "dqpb",
    label: "Dqpb",
  },
};

export const Earth: Story = {
  args: {
    animation: "earth",
    label: "Earth",
  },
};

export const Fillsweep: Story = {
  args: {
    animation: "fillsweep",
    label: "Fillsweep",
  },
};

export const GrowHorizontal: Story = {
  args: {
    animation: "grow-horizontal",
    label: "Grow Horizontal",
  },
};

export const GrowVertical: Story = {
  args: {
    animation: "grow-vertical",
    label: "Grow Vertical",
  },
};

export const Hearts: Story = {
  args: {
    animation: "hearts",
    label: "Hearts",
  },
};

export const Helix: Story = {
  args: {
    animation: "helix",
    label: "Helix",
  },
};

export const Moon: Story = {
  args: {
    animation: "moon",
    label: "Moon",
  },
};

export const Noise: Story = {
  args: {
    animation: "noise",
    label: "Noise",
  },
};

export const Orbit: Story = {
  args: {
    animation: "orbit",
    label: "Orbit",
  },
};

export const Point: Story = {
  args: {
    animation: "point",
    label: "Point",
  },
};

export const Pulse: Story = {
  args: {
    animation: "pulse",
    label: "Pulse",
  },
};

export const Rain: Story = {
  args: {
    animation: "rain",
    label: "Rain",
  },
};

export const RollingLine: Story = {
  args: {
    animation: "rolling-line",
    label: "Rolling Line",
  },
};

export const Sand: Story = {
  args: {
    animation: "sand",
    label: "Sand",
  },
};

export const Scan: Story = {
  args: {
    animation: "scan",
    label: "Scan",
  },
};

export const Scanline: Story = {
  args: {
    animation: "scanline",
    label: "Scanline",
  },
};

export const SimpleDots: Story = {
  args: {
    animation: "simple-dots",
    label: "Simple Dots",
  },
};

export const SimpleDotsScrolling: Story = {
  args: {
    animation: "simple-dots-scrolling",
    label: "Simple Dots Scrolling",
  },
};

export const Snake: Story = {
  args: {
    animation: "snake",
    label: "Snake",
  },
};

export const Sparkle: Story = {
  args: {
    animation: "sparkle",
    label: "Sparkle",
  },
};

export const Speaker: Story = {
  args: {
    animation: "speaker",
    label: "Speaker",
  },
};

export const SquareCorners: Story = {
  args: {
    animation: "square-corners",
    label: "Square Corners",
  },
};

export const Toggle: Story = {
  args: {
    animation: "toggle",
    label: "Toggle",
  },
};

export const Triangle: Story = {
  args: {
    animation: "triangle",
    label: "Triangle",
  },
};

export const Wave: Story = {
  args: {
    animation: "wave",
    label: "Wave",
  },
};

export const Waverows: Story = {
  args: {
    animation: "waverows",
    label: "Waverows",
  },
};

export const Weather: Story = {
  args: {
    animation: "weather",
    label: "Weather",
  },
};
