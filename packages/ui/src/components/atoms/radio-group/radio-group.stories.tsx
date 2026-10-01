// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "../label/label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  component: RadioGroup,
  title: "Core/RadioGroup",
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: "Default", value: "default" },
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];

export const Default: Story = {
  render: (args) => (
    <RadioGroup aria-label="Row density" defaultValue="comfortable" {...args}>
      {options.map((option) => (
        <div className="flex items-center gap-2" key={option.value}>
          <RadioGroupItem id={`density-${option.value}`} value={option.value} />
          <Label htmlFor={`density-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};
