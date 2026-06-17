import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../input/input";
import { Label } from "../label/label";
import { Fieldset, FieldsetContent, FieldsetLegend } from "./fieldset";

const meta = {
  component: Fieldset,
  title: "Form/Fieldset",
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Fieldset className="w-80">
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <FieldsetContent>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="street">Street</Label>
          <Input id="street" placeholder="123 Main St" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Springfield" />
        </div>
      </FieldsetContent>
    </Fieldset>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Fieldset className="w-80" disabled>
      <FieldsetLegend>Disabled group</FieldsetLegend>
      <FieldsetContent>
        <Input placeholder="Cannot edit" />
      </FieldsetContent>
    </Fieldset>
  ),
};
