import { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Scrim } from "./scrim";

describe("Scrim", () => {
  it("renders a hidden div with the dim classes by default", () => {
    render(<Scrim data-testid="scrim" />);
    const scrim = screen.getByTestId("scrim");
    expect(scrim.tagName).toBe("DIV");
    expect(scrim).toHaveAttribute("aria-hidden", "true");
    expect(scrim).toHaveClass("absolute", "inset-0", "bg-black/50");
    expect(scrim).not.toHaveClass("bg-black/80");
  });

  it("renders the strong classes for level strong", () => {
    render(<Scrim data-testid="scrim" level="strong" />);
    const scrim = screen.getByTestId("scrim");
    expect(scrim).toHaveClass("absolute", "inset-0", "bg-black/80");
    expect(scrim).not.toHaveClass("bg-black/50");
  });

  it("renders the dim classes for level dim", () => {
    render(<Scrim data-testid="scrim" level="dim" />);
    expect(screen.getByTestId("scrim")).toHaveClass("bg-black/50");
  });

  it("falls back to dim when level is undefined", () => {
    render(<Scrim data-testid="scrim" level={undefined} />);
    expect(screen.getByTestId("scrim")).toHaveClass("bg-black/50");
  });

  it("merges className and lets the host switch to fixed", () => {
    render(<Scrim className="fixed z-50" data-testid="scrim" />);
    const scrim = screen.getByTestId("scrim");
    expect(scrim).toHaveClass("fixed", "z-50", "inset-0", "bg-black/50");
    expect(scrim).not.toHaveClass("absolute");
  });

  it("passes the ref through to the div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Scrim ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("aria-hidden", "true");
  });

  it("passes other props through", () => {
    render(<Scrim data-state="open" data-testid="scrim" id="backdrop" />);
    const scrim = screen.getByTestId("scrim");
    expect(scrim).toHaveAttribute("data-state", "open");
    expect(scrim).toHaveAttribute("id", "backdrop");
  });

  it("renders no content and stays out of the accessibility tree", () => {
    const { container } = render(<Scrim />);
    expect(container.firstChild).toBeEmptyDOMElement();
    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("has the displayName Scrim", () => {
    expect(Scrim.displayName).toBe("Scrim");
  });
});
