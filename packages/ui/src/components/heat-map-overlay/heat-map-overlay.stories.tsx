import type { Meta, StoryObj } from "@storybook/react-vite";

import { type HeatMapPoint, HeatMapOverlay } from "./heat-map-overlay";

const POINTS: HeatMapPoint[] = [
  { id: "ny", lat: 40.7, lng: -74, weight: 0.95 },
  { id: "ldn", lat: 51.5, lng: -0.13, weight: 0.7 },
  { id: "par", lat: 48.85, lng: 2.35, weight: 0.6 },
  { id: "tok", lat: 35.7, lng: 139.7, weight: 0.85 },
  { id: "syd", lat: -33.9, lng: 151.2, weight: 0.5 },
  { id: "rio", lat: -22.9, lng: -43.2, weight: 0.45 },
  { id: "lag", lat: 6.5, lng: 3.4, weight: 0.55 },
  { id: "mum", lat: 19.07, lng: 72.87, weight: 0.7 },
];

const meta = {
  args: {
    data: POINTS,
    radius: 50,
  },
  component: HeatMapOverlay,
  title: "Maps/HeatMapOverlay",
} satisfies Meta<typeof HeatMapOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TightRadius: Story = {
  args: {
    blur: 6,
    radius: 25,
  },
};

export const CustomGradient: Story = {
  args: {
    gradient: {
      0.3: "rgba(59, 130, 246, 0.6)",
      0.7: "rgba(168, 85, 247, 0.85)",
      1: "rgba(236, 72, 153, 0.95)",
    },
  },
};

export const HighOpacity: Story = {
  args: {
    opacity: 1,
  },
};

export const WithInfoPanel: Story = {
  render: (args) => (
    <HeatMapOverlay {...args}>
      <p className="font-medium">Global activity</p>
      <p className="text-muted-foreground">8 hotspots · 2024</p>
    </HeatMapOverlay>
  ),
};
