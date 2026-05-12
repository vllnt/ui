import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type ChoroplethRegion,
  ChoroplethLegend,
  ChoroplethMap,
  ChoroplethTooltip,
} from "./choropleth-map";

const REGIONS: ChoroplethRegion[] = [
  {
    coordinates: [
      [-5, 51],
      [10, 51],
      [10, 41],
      [-5, 41],
      [-5, 51],
    ],
    id: "FR",
    name: "France",
  },
  {
    coordinates: [
      [5, 55],
      [15, 55],
      [15, 47],
      [5, 47],
      [5, 55],
    ],
    id: "DE",
    name: "Germany",
  },
  {
    coordinates: [
      [6, 47],
      [18, 47],
      [18, 37],
      [6, 37],
      [6, 47],
    ],
    id: "IT",
    name: "Italy",
  },
  {
    coordinates: [
      [-9, 44],
      [3, 44],
      [3, 36],
      [-9, 36],
      [-9, 44],
    ],
    id: "ES",
    name: "Spain",
  },
  {
    coordinates: [
      [21, 60],
      [40, 60],
      [40, 50],
      [21, 50],
      [21, 60],
    ],
    id: "PL",
    name: "Poland",
  },
];

const DATA: Record<string, number> = {
  DE: 4082,
  ES: 1397,
  FR: 2937,
  IT: 2107,
  PL: 716,
};

const meta = {
  args: {
    data: DATA,
    regions: REGIONS,
  },
  component: ChoroplethMap,
  title: "Maps/ChoroplethMap",
} satisfies Meta<typeof ChoroplethMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ChoroplethMap {...args}>
      <ChoroplethTooltip />
      <ChoroplethLegend title="GDP (B USD)" />
    </ChoroplethMap>
  ),
};

export const DivergingScale: Story = {
  args: {
    colorScale: ["#1d4ed8", "#f8fafc", "#dc2626"],
    data: { DE: -10, ES: 6, FR: -2, IT: 4, PL: 12 },
    domain: [-15, 15],
  },
  render: (args) => (
    <ChoroplethMap {...args}>
      <ChoroplethTooltip />
      <ChoroplethLegend title="Δ vs target (%)" />
    </ChoroplethMap>
  ),
};

export const MissingData: Story = {
  args: {
    data: { DE: 4082, FR: 2937 },
  },
  render: (args) => (
    <ChoroplethMap {...args}>
      <ChoroplethTooltip />
      <ChoroplethLegend title="GDP (B USD)" />
    </ChoroplethMap>
  ),
};

export const CustomTooltip: Story = {
  render: (args) => (
    <ChoroplethMap {...args}>
      <ChoroplethTooltip>
        {({ region, value }) => (
          <span>
            <strong>{region.name}</strong> ({region.id})
            {value === undefined ? (
              <span className="text-muted-foreground">: no data</span>
            ) : (
              <span>: ${value.toLocaleString()}B</span>
            )}
          </span>
        )}
      </ChoroplethTooltip>
      <ChoroplethLegend title="GDP" />
    </ChoroplethMap>
  ),
};
