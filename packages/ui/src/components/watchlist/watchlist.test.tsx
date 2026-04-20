import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Watchlist } from "./watchlist";

const items = [
  {
    change: 1.42,
    name: "Apple Inc.",
    price: 182.33,
    starred: true,
    symbol: "AAPL",
    volume: "Vol 32M",
  },
  {
    change: -0.64,
    name: "Microsoft",
    price: 431.8,
    symbol: "MSFT",
  },
];

describe("Watchlist", () => {
  it("renders tracked symbols with names and prices", () => {
    render(<Watchlist items={items} />);

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(screen.getByText("MSFT")).toBeInTheDocument();
    expect(screen.getByText("182.33")).toBeInTheDocument();
  });

  it("formats positive and negative changes", () => {
    render(<Watchlist items={items} />);

    expect(screen.getByText("+1.42%")).toBeInTheDocument();
    expect(screen.getByText("-0.64%")).toBeInTheDocument();
  });

  it("summarizes advancing vs declining counts", () => {
    render(<Watchlist items={items} />);

    expect(screen.getByText("1 up")).toBeInTheDocument();
    expect(screen.getByText("1 down")).toBeInTheDocument();
  });

  it("renders the configured title as section label", () => {
    render(<Watchlist items={items} title="Momentum list" />);

    expect(screen.getByLabelText("Momentum list")).toBeInTheDocument();
  });

  it("returns null when the list is empty", () => {
    const { container } = render(<Watchlist items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
