import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Kbd } from "./kbd";

const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0";
const WIN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0";

const originalUserAgent = Object.getOwnPropertyDescriptor(
  navigator,
  "userAgent",
);

function stubUserAgent(userAgent: string): void {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: userAgent,
    writable: true,
  });
}

describe("Kbd", () => {
  afterEach(() => {
    if (originalUserAgent) {
      Object.defineProperty(navigator, "userAgent", originalUserAgent);
    } else {
      Reflect.deleteProperty(navigator, "userAgent");
    }
  });

  it("renders children inside a kbd element", () => {
    stubUserAgent(WIN_UA);
    const { container } = render(<Kbd>K</Kbd>);
    expect(screen.getByText("K").tagName).toBe("KBD");
    expect(container.querySelector("kbd")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("supports %s size", (size) => {
    stubUserAgent(WIN_UA);
    render(<Kbd size={size}>X</Kbd>);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("renders one kbd per token with an aria-label for the wrapper", () => {
    stubUserAgent(WIN_UA);
    render(<Kbd shortcut="ctrl+k" />);
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
    expect(screen.getByLabelText("Ctrl + K")).toBeInTheDocument();
  });

  it("expands `mod` to ⌘ on Mac and renders glyphs for special keys", () => {
    stubUserAgent(MAC_UA);
    render(<Kbd shortcut="mod+k" />);
    expect(screen.getByText("⌘")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
    render(<Kbd shortcut="enter" />);
    expect(screen.getByText("↵")).toBeInTheDocument();
  });

  it("expands `mod` to Ctrl on non-Mac", () => {
    stubUserAgent(WIN_UA);
    render(<Kbd shortcut="mod+shift+p" />);
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("Shift")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
  });
});
