import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketTreemap } from "./market-treemap";

const items = [
  { change: 2.6, label: "NVDA", sector: "Semis", value: 980 },
  { change: -1.4, label: "XOM", sector: "Energy", value: 520 },
  { change: 0.8, label: "MSFT", sector: "Software", value: 760 },
];

describe("MarketTreemap", () => {
  it("renders market tiles", () => {
    render(<MarketTreemap items={items} />);

    expect(screen.getByText("Market treemap")).toBeInTheDocument();
    expect(screen.getByText("NVDA")).toBeInTheDocument();
    expect(screen.getByText("XOM")).toBeInTheDocument();
  });

  it("shows signed percentage changes", () => {
    render(<MarketTreemap items={items} />);

    expect(screen.getByText("+2.60%")).toBeInTheDocument();
    expect(screen.getByText("-1.40%")).toBeInTheDocument();
  });

  it("returns null with no tiles", () => {
    const { container } = render(<MarketTreemap items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
