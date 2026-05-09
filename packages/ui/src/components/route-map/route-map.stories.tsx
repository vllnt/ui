import type { Meta, StoryObj } from "@storybook/react-vite";

import { type RouteWaypoint, RouteMap } from "./route-map";

const SILK_ROAD: RouteWaypoint[] = [
  { id: "chang", label: "Chang'an", position: [108.94, 34.34] },
  { id: "kashgar", label: "Kashgar", position: [75.99, 39.47] },
  { id: "samarkand", label: "Samarkand", position: [66.97, 39.65] },
  { id: "baghdad", label: "Baghdad", position: [44.36, 33.31] },
  { id: "constantinople", label: "Constantinople", position: [28.98, 41.01] },
];

const COLUMBUS: RouteWaypoint[] = [
  { id: "palos", label: "Palos", position: [-6.89, 37.23] },
  { id: "canary", label: "Canary Islands", position: [-15.42, 28.29] },
  { id: "san-salvador", label: "San Salvador", position: [-74.5, 24] },
  { id: "cuba", label: "Cuba", position: [-78, 21.5] },
];

const meta = {
  args: {
    color: "red",
    lineStyle: "dashed",
    waypoints: SILK_ROAD,
  },
  component: RouteMap,
  title: "Maps/RouteMap",
} satisfies Meta<typeof RouteMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Animated: Story = {
  args: {
    animated: true,
    showProgressIndicator: true,
  },
};

export const ColumbusVoyage: Story = {
  args: {
    color: "blue",
    lineStyle: "solid",
    waypoints: COLUMBUS,
  },
};

export const WithInfoPanel: Story = {
  render: (args) => (
    <RouteMap {...args}>
      <p className="font-medium">Silk Road</p>
      <p className="text-muted-foreground">5 waypoints · 7,500 km</p>
    </RouteMap>
  ),
};

export const Dotted: Story = {
  args: {
    color: "emerald",
    lineStyle: "dotted",
  },
};
