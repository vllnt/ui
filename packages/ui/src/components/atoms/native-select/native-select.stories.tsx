import type { Meta, StoryObj } from "@storybook/react-vite";

import { NativeSelect } from "./native-select";

const meta = {
  component: NativeSelect,
  title: "Form/NativeSelect",
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NativeSelect aria-label="Timezone" className="w-72" defaultValue="utc">
      <option value="utc">UTC</option>
      <option value="est">Eastern</option>
      <option value="pst">Pacific</option>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <NativeSelect aria-label="Timezone" className="w-72" disabled>
      <option value="utc">UTC</option>
    </NativeSelect>
  ),
};
