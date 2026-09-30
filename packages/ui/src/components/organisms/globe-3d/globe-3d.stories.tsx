import type { Meta, StoryObj } from "@storybook/react-vite";

import { Globe3D, GlobeArc, GlobeMarker } from "./globe-3d";

const meta = {
  args: {
    autoRotate: true,
    initialPosition: { lat: 20, lng: 0 },
    rotationSpeed: 8,
  },
  component: Globe3D,
  title: "Maps/Globe3D",
} satisfies Meta<typeof Globe3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Globe3D {...args}>
      <GlobeMarker color="blue" id="paris" label="Paris" lat={48.85} lng={2.35} />
      <GlobeMarker color="red" id="ny" label="New York" lat={40.71} lng={-74} />
      <GlobeMarker color="emerald" id="tokyo" label="Tokyo" lat={35.7} lng={139.7} />
      <GlobeMarker color="rose" id="syd" label="Sydney" lat={-33.9} lng={151.2} />
      <GlobeArc
        color="cyan"
        from={{ lat: 48.85, lng: 2.35 }}
        id="paris-ny"
        to={{ lat: 40.71, lng: -74 }}
      />
      <GlobeArc
        color="amber"
        from={{ lat: 40.71, lng: -74 }}
        id="ny-tokyo"
        to={{ lat: 35.7, lng: 139.7 }}
      />
    </Globe3D>
  ),
};

export const Static: Story = {
  args: {
    autoRotate: false,
    initialPosition: { lat: 30, lng: -30 },
  },
  render: (args) => (
    <Globe3D {...args}>
      <GlobeMarker color="blue" id="paris" label="Paris" lat={48.85} lng={2.35} />
      <GlobeMarker color="red" id="ny" label="New York" lat={40.71} lng={-74} />
    </Globe3D>
  ),
};

export const SlowRotation: Story = {
  args: {
    autoRotate: true,
    rotationSpeed: 2,
  },
  render: (args) => (
    <Globe3D {...args}>
      <GlobeMarker color="cyan" id="lagos" label="Lagos" lat={6.5} lng={3.4} />
      <GlobeMarker color="purple" id="mumbai" label="Mumbai" lat={19.07} lng={72.87} />
      <GlobeMarker color="rose" id="seoul" label="Seoul" lat={37.57} lng={126.98} />
    </Globe3D>
  ),
};
