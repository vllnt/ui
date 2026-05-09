import type { Meta, StoryObj } from "@storybook/react-vite";

import { JarvisDock } from "./jarvis-dock";

const noop = (): void => undefined;

const meta = {
  args: {
    actions: [
      {
        glyph: "+",
        id: "summon",
        label: "Summon",
        onActivate: noop,
        tone: "primary",
      },
      {
        badge: "3",
        glyph: "✓",
        id: "review",
        label: "Review",
        onActivate: noop,
        tone: "success",
      },
      { glyph: "↻", id: "retry", label: "Retry", onActivate: noop },
      { glyph: "⏵", id: "play", label: "Play", onActivate: noop },
      {
        glyph: "⏸",
        id: "pause",
        label: "Pause",
        onActivate: noop,
        tone: "danger",
      },
    ],
    onOpenPalette: noop,
  },
  component: JarvisDock,
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center bg-muted/40 p-8">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/JarvisDock",
} satisfies Meta<typeof JarvisDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoPalette: Story = {
  args: { onOpenPalette: undefined },
};

export const ActionsOnly: Story = {
  args: {
    actions: [
      { glyph: "+", id: "summon", label: "Summon", onActivate: noop },
    ],
    onOpenPalette: undefined,
  },
};

export const WithBadges: Story = {
  args: {
    actions: [
      {
        badge: "•",
        glyph: "✉",
        id: "inbox",
        label: "Inbox",
        onActivate: noop,
        tone: "primary",
      },
      {
        badge: "12",
        glyph: "!",
        id: "alerts",
        label: "Alerts",
        onActivate: noop,
        tone: "danger",
      },
      {
        badge: "2",
        glyph: "✓",
        id: "review",
        label: "Review",
        onActivate: noop,
        tone: "success",
      },
    ],
  },
};
