import type { Meta, StoryObj } from "@storybook/react-vite";

import { FlowDiagram } from "./flow-diagram";

const meta = {
  component: FlowDiagram,
  title: "Data/FlowDiagram",
} satisfies Meta<typeof FlowDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
