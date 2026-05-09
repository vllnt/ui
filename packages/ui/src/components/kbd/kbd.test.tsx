import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Kbd } from "./kbd";

function stubUserAgent(userAgent: string): () => void {
  const original = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: userAgent,
    writable: true,
  });
  return () => {
    if (original) {
      Object.defineProperty(navigator, "userAgent", original);
    } else {
      Reflect.deleteProperty(navigator, "userAgent");
    }
  };
}

const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0";
const WIN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0";

function noopRestore(): void {
  return;
}

describe("Kbd", () => {
  let restore: () => void = noopRestore;

  afterEach(() => {
    restore();
    vi.restoreAllMocks();
  });

  describe("children mode", () => {
    it("renders children inside a kbd element", () => {
      restore = stubUserAgent(WIN_UA);
      render(<Kbd>K</Kbd>);

      const element = screen.getByText("K");
      expect(element.tagName).toBe("KBD");
    });

    it.each(["sm", "md", "lg"] as const)("supports %s size", (size) => {
      restore = stubUserAgent(WIN_UA);
      render(<Kbd size={size}>X</Kbd>);

      expect(screen.getByText("X")).toBeInTheDocument();
    });
  });

  describe("shortcut mode", () => {
    it("renders one kbd per token", () => {
      restore = stubUserAgent(WIN_UA);
      render(<Kbd shortcut="ctrl+k" />);

      expect(screen.getByText("Ctrl")).toBeInTheDocument();
      expect(screen.getByText("K")).toBeInTheDocument();
    });

    it("expands `mod` to ⌘ on Mac", () => {
      restore = stubUserAgent(MAC_UA);
      render(<Kbd shortcut="mod+k" />);

      expect(screen.getByText("⌘")).toBeInTheDocument();
      expect(screen.getByText("K")).toBeInTheDocument();
    });

    it("expands `mod` to Ctrl on non-Mac", () => {
      restore = stubUserAgent(WIN_UA);
      render(<Kbd shortcut="mod+shift+p" />);

      expect(screen.getByText("Ctrl")).toBeInTheDocument();
      expect(screen.getByText("Shift")).toBeInTheDocument();
      expect(screen.getByText("P")).toBeInTheDocument();
    });

    it("renders glyphs for special keys", () => {
      restore = stubUserAgent(MAC_UA);
      render(<Kbd shortcut="enter" />);

      expect(screen.getByText("↵")).toBeInTheDocument();
    });

    it("emits an aria-label for the wrapper", () => {
      restore = stubUserAgent(WIN_UA);
      render(<Kbd shortcut="ctrl+k" />);

      expect(screen.getByLabelText("Ctrl + K")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("renders as a kbd element by default", () => {
      restore = stubUserAgent(WIN_UA);
      const { container } = render(<Kbd>X</Kbd>);

      expect(container.querySelector("kbd")).toBeInTheDocument();
    });
  });
});
