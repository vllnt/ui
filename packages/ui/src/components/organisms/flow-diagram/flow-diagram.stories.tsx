import type { Meta, StoryObj } from "@storybook/react-vite";

import { FlowDiagram } from "./flow-diagram";

const meta = {
  args: {
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
    ],
    nodes: [
      {
        data: { description: "Entry point", label: "Start" },
        id: "1",
        position: { x: 0, y: 0 },
      },
      {
        data: { description: "Processing step", label: "Process" },
        id: "2",
        position: { x: 200, y: 0 },
      },
      {
        data: { description: "Final step", label: "End" },
        id: "3",
        position: { x: 400, y: 0 },
      },
    ],
  },
  component: FlowDiagram,
  title: "Data/FlowDiagram",
} satisfies Meta<typeof FlowDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
