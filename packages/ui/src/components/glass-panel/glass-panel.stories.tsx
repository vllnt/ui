import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlassPanel } from "./glass-panel";

const meta = {
  component: GlassPanel,
  render: () => (
    <div className="w-full max-w-md bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.08),transparent_45%)] p-8">
      <GlassPanel className="p-6">
        <div className="text-sm font-medium text-foreground">Floating shell chrome</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use GlassPanel to wrap secondary chrome without taking over the main canvas surface.
        </p>
      </GlassPanel>
    </div>
  ),
  title: "Layout/GlassPanel",
} satisfies Meta<typeof GlassPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
