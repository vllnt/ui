import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderBook } from "./order-book";

const asks = [
  { price: 185.24, size: 4.2 },
  { price: 185.31, size: 6.8 },
  { price: 185.39, size: 8.1 },
];

const bids = [
  { price: 185.18, size: 5.4 },
  { price: 185.11, size: 7.1 },
  { price: 185.03, size: 9.2 },
];

describe("OrderBook", () => {
  it("renders both sides of the book", () => {
    render(<OrderBook asks={asks} bids={bids} />);

    expect(screen.getByText("Order book")).toBeInTheDocument();
    expect(screen.getByText("Asks")).toBeInTheDocument();
    expect(screen.getByText("Bids")).toBeInTheDocument();
  });

  it("formats the spread", () => {
    render(<OrderBook asks={asks} bids={bids} precision={2} />);

    expect(screen.getByText("Spread 0.06")).toBeInTheDocument();
  });

  it("returns null when there is no order flow", () => {
    const { container } = render(<OrderBook asks={[]} bids={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
