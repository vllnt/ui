import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TickerTape } from "./ticker-tape";

const items = [
  { change: 1.42, price: 182.33, symbol: "AAPL", volume: "Vol 32M" },
  { change: -0.64, price: 431.8, symbol: "MSFT", volume: "Vol 18M" },
];

describe("TickerTape", () => {
  it("renders ticker items", () => {
    render(<TickerTape items={items} />);

    expect(screen.getAllByText("AAPL")).toHaveLength(2);
    expect(screen.getAllByText("MSFT")).toHaveLength(2);
    expect(screen.getAllByText("+1.42%")).toHaveLength(2);
  });

  it("returns null for an empty feed", () => {
    const { container } = render(<TickerTape items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("duplicates content for seamless scrolling", () => {
    render(<TickerTape items={items} />);

    expect(screen.getByLabelText("TickerTape")).toBeInTheDocument();
    expect(screen.getAllByText("Vol 32M")).toHaveLength(2);
  });
});
