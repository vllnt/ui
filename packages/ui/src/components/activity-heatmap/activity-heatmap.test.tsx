import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityHeatmap } from "./activity-heatmap";

const data = [
  { count: 2, date: "2026-03-01" },
  { count: 6, date: "2026-03-02" },
  { count: 9, date: "2026-03-03" },
];

describe("ActivityHeatmap", () => {
  it("renders its title and legend", () => {
    render(
      <ActivityHeatmap
        data={data}
        endDate="2026-03-14T00:00:00.000Z"
        title="Deployment activity"
        weeks={2}
      />,
    );

    expect(screen.getByText("Deployment activity")).toBeInTheDocument();
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
