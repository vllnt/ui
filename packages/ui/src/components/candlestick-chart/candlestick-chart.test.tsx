import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CandlestickChart } from "./candlestick-chart";

const data = [
  { close: 189.8, high: 191.2, label: "Mon", low: 182.4, open: 184.6 },
  { close: 186.1, high: 193.5, label: "Tue", low: 184.8, open: 190.3 },
  { close: 194.6, high: 196.8, label: "Wed", low: 185.9, open: 186.5 },
];

describe("CandlestickChart", () => {
  it("renders the chart with OHLC candles", () => {
    render(<CandlestickChart data={data} />);

    expect(
      screen.getByRole("img", { name: "Candlestick chart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Candlestick chart")).toBeInTheDocument();
  });

  it("returns null when no candles are provided", () => {
    const { container } = render(<CandlestickChart data={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a title for each candle body", () => {
    render(<CandlestickChart data={data} />);

    const title = screen.getByText(/mon: o 184.60 h 191.20 l 182.40 c 189.80/i);
    expect(title).toBeInTheDocument();
  });
});
