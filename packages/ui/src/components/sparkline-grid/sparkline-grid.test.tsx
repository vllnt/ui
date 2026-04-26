import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SparklineGrid } from "./sparkline-grid";

const items = [
  {
    change: 2.14,
    data: [14, 16, 17, 15, 19, 22],
    label: "Tech momentum",
    value: "$12.8M",
  },
  {
    change: -1.08,
    data: [9, 8, 7, 8, 6, 5],
    label: "Energy breadth",
    value: "$8.4M",
  },
];

describe("SparklineGrid", () => {
  it("renders cards and sparkline charts", () => {
    render(<SparklineGrid items={items} />);

    expect(screen.getByText("Tech momentum")).toBeInTheDocument();
    expect(screen.getByText("Energy breadth")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Tech momentum sparkline" }),
    ).toBeInTheDocument();
  });

  it("returns null for empty items", () => {
    const { container } = render(<SparklineGrid items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows formatted positive and negative changes", () => {
    render(<SparklineGrid items={items} />);

    expect(screen.getByText("+2.14%")).toBeInTheDocument();
    expect(screen.getByText("-1.08%")).toBeInTheDocument();
  });
});
