import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type GeoJSONPolygon,
  Map2D,
  MapControls,
  MapLayer,
  MapMarker,
  MapPopup,
  MapZoomIn,
  MapZoomOut,
} from "./map-2d";

const FRANCE: GeoJSONPolygon = {
  coordinates: [
    [-5, 51],
    [10, 51],
    [10, 41],
    [-5, 41],
    [-5, 51],
  ],
  id: "france-bbox",
  type: "polygon",
};

const meta = {
  args: {
    center: [2, 48],
    zoom: 2,
  },
  component: Map2D,
  title: "Maps/Map2D",
} satisfies Meta<typeof Map2D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Map2D {...args}>
      <MapLayer data={[FRANCE]} />
      <MapMarker popup="Paris" position={[2.35, 48.85]} />
      <MapMarker popup="London" position={[-0.13, 51.5]} />
      <MapMarker popup="Berlin" position={[13.4, 52.52]} />
      <MapControls>
        <MapZoomIn />
        <MapZoomOut />
      </MapControls>
    </Map2D>
  ),
};

export const WithBackdrop: Story = {
  args: {
    backdrop:
      "https://placehold.co/1000x500/0d1117/2c3e50/png?text=World+Backdrop",
    backdropAlt: "World map backdrop",
    center: [0, 20],
    zoom: 1,
  },
  render: (args) => (
    <Map2D {...args}>
      <MapMarker popup="New York" position={[-74, 40.7]} />
      <MapMarker popup="Tokyo" position={[139.7, 35.7]} />
      <MapMarker popup="Sydney" position={[151.2, -33.9]} />
      <MapControls>
        <MapZoomIn />
        <MapZoomOut />
      </MapControls>
    </Map2D>
  ),
};

export const WithStandalonePopup: Story = {
  args: { center: [2.35, 48.85], zoom: 4 },
  render: (args) => (
    <Map2D {...args}>
      <MapMarker popup="Paris" position={[2.35, 48.85]} />
      <MapPopup position={[2.35, 48.85]}>
        <p className="text-sm font-medium">Selected: Paris</p>
        <p className="text-xs text-muted-foreground">
          Population: 2.1M (city proper)
        </p>
      </MapPopup>
      <MapControls>
        <MapZoomIn />
        <MapZoomOut />
      </MapControls>
    </Map2D>
  ),
};

export const NoControls: Story = {
  render: (args) => (
    <Map2D {...args}>
      <MapMarker popup="Paris" position={[2.35, 48.85]} />
      <MapMarker popup="London" position={[-0.13, 51.5]} />
    </Map2D>
  ),
};
