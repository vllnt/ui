// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeSwitcher } from "../theme-switcher/theme-switcher";

import { ThemePresetProvider } from "./theme-preset-provider";

const meta = {
  component: ThemePresetProvider,
  parameters: {
    layout: "centered",
  },
  title: "Utility/ThemePresetProvider",
} satisfies Meta<typeof ThemePresetProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ThemePresetProvider>
      <div className="flex flex-col items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Pick a preset, then reload — the choice is restored before paint.
        </span>
        <ThemeSwitcher />
      </div>
    </ThemePresetProvider>
  ),
};
