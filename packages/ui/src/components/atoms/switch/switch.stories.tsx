// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "../label/label";
import { Switch } from "./switch";

const meta = {
  component: Switch,
  title: "Utility/Switch",
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-airplane" {...args} />
      <Label htmlFor="switch-airplane">Airplane mode</Label>
    </div>
  ),
};
