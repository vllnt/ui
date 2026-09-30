import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ChoroplethLegend,
  ChoroplethMap,
  type ChoroplethRegion,
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
];

const DATA = { DE: 4082, FR: 2937 };

const region = (container: HTMLElement, id: string): Element => {
  const path = container.querySelector(`[data-region-id='${id}']`);
  expect(path).not.toBeNull();
  return path ?? container;
};

describe("ChoroplethMap", () => {
  it("renders one path per region plus the accessible data table fallback", () => {
    const { container } = render(
      <ChoroplethMap data={DATA} regions={REGIONS} />,
    );
    expect(
      container.querySelector("[data-region-id='FR']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-region-id='DE']"),
    ).toBeInTheDocument();
    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("4,082")).toBeInTheDocument();
  });

  it("uses the missing color when a region has no data", () => {
    const { container } = render(
      <ChoroplethMap
        data={{ FR: 100 }}
        missingColor="#ff00ff"
        regions={REGIONS}
      />,
    );
    expect(region(container, "DE")).toHaveAttribute("fill", "#ff00ff");
  });

  it("fires onSelectRegion and marks the clicked region with data-selected", () => {
    const onSelectRegion = vi.fn();
    const { container } = render(
      <ChoroplethMap
        data={DATA}
        onSelectRegion={onSelectRegion}
        regions={REGIONS}
      />,
    );
    fireEvent.click(region(container, "FR"));
    expect(onSelectRegion).toHaveBeenCalledWith(
      expect.objectContaining({ id: "FR" }),
    );
    expect(region(container, "FR")).toHaveAttribute("data-selected", "true");
  });

  it("shows the default tooltip on hover and hides it on mouse leave", () => {
    const { container } = render(
      <ChoroplethMap data={DATA} regions={REGIONS}>
        <ChoroplethTooltip />
      </ChoroplethMap>,
    );
    fireEvent.mouseEnter(region(container, "FR"));
    expect(screen.getAllByText(/France/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2,937/).length).toBeGreaterThan(0);
    fireEvent.mouseLeave(region(container, "FR"));
    expect(container.querySelector("[data-tooltip-region-id]")).toBeNull();
  });

  it("invokes the tooltip render-prop with region + value", () => {
    const { container } = render(
      <ChoroplethMap data={DATA} regions={REGIONS}>
        <ChoroplethTooltip>
          {({ region: hovered, value }) => (
            <span>
              Custom: {hovered.name} = {value ?? "?"}
            </span>
          )}
        </ChoroplethTooltip>
      </ChoroplethMap>,
    );
    fireEvent.mouseEnter(region(container, "DE"));
    expect(screen.getByText(/Custom: Germany = 4082/)).toBeInTheDocument();
  });

  it("renders the legend with min and max labels from the domain", () => {
    const { container } = render(
      <ChoroplethMap data={DATA} regions={REGIONS}>
        <ChoroplethLegend title="GDP" />
      </ChoroplethMap>,
    );
    expect(screen.getByText("GDP")).toBeInTheDocument();
    expect(screen.getAllByText("2,937").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4,082").length).toBeGreaterThan(0);
    expect(container.querySelector("[data-legend]")).toBeInTheDocument();
  });
});
