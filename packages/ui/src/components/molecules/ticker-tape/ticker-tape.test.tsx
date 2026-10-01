import { fireEvent, render, screen } from "@testing-library/react";
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

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(<TickerTape items={items} />);
    const track = container.querySelector<HTMLElement>("[data-ticker-tape-track]");
    expect(track?.getAttribute("style") ?? "").not.toMatch(/animation(-name)?:/);
    expect(track).toHaveClass("motion-reduce:animate-none");
    expect(track).toHaveClass("focus-within:[animation-play-state:paused]");
  });

  it("offers a keyboard-operable pause control that stops the scroll (WCAG 2.2.2)", () => {
    const { container } = render(<TickerTape items={items} />);
    const track = container.querySelector<HTMLElement>("[data-ticker-tape-track]");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(track).toHaveClass("[animation-play-state:paused]");
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(track).not.toHaveClass("[animation-play-state:paused]");
  });

  it("lets hosts localize or opt out of the pause control", () => {
    const { rerender } = render(
      <TickerTape items={items} labels={{ pause: "Pausar", play: "Reproducir" }} />,
    );
    expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument();
    rerender(<TickerTape items={items} pauseControl={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("uses AA-contrast change badge colours on the light tint", () => {
    render(<TickerTape items={items} />);
    const [up] = screen.getAllByText("+1.42%");
    const [down] = screen.getAllByText("-0.64%");
    expect(up.closest("div,span")).toHaveClass("text-emerald-700");
    expect(down.closest("div,span")).toHaveClass("text-rose-700");
  });
});
