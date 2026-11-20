import { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Kbd, kbdVariants } from "./kbd";

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

  it("trims whitespace around tokens, including the whole shortcut", () => {
    stubUserAgent(WIN_UA);
    render(<Kbd shortcut="  ctrl +  k  " />);
    expect(screen.getByLabelText("Ctrl + K")).toBeInTheDocument();
  });

  it("parses shortcuts with long whitespace runs in linear time", () => {
    stubUserAgent(WIN_UA);
    const start = performance.now();
    render(<Kbd shortcut={`ctrl${" ".repeat(50_000)}+k`} />);
    expect(performance.now() - start).toBeLessThan(1000);
    expect(screen.getByLabelText("Ctrl + K")).toBeInTheDocument();
  });

  it("expands `mod` to a vector command icon on Mac and renders glyphs for special keys", () => {
    stubUserAgent(MAC_UA);
    render(<Kbd shortcut="mod+k" />);
    expect(screen.getByRole("img", { name: "Command" })).toBeInTheDocument();
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

  describe("platform", () => {
    it("auto follows the user agent: command icon on Mac, Ctrl elsewhere", () => {
      stubUserAgent(MAC_UA);
      const mac = render(<Kbd platform="auto" shortcut="mod+k" />);
      expect(mac.container.querySelector("svg")).toBeInTheDocument();
      expect(screen.queryByText("Ctrl")).not.toBeInTheDocument();
      mac.unmount();

      stubUserAgent(WIN_UA);
      const win = render(<Kbd platform="auto" shortcut="mod+k" />);
      expect(win.container.querySelector("svg")).not.toBeInTheDocument();
      expect(screen.getByText("Ctrl")).toBeInTheDocument();
    });

    it("defaults to auto when the prop is omitted", () => {
      stubUserAgent(MAC_UA);
      const { container } = render(<Kbd shortcut="mod+k" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("mac forces the command icon on a Windows user agent", () => {
      stubUserAgent(WIN_UA);
      render(<Kbd platform="mac" shortcut="mod+k" />);
      expect(screen.getByRole("img", { name: "Command" })).toBeInTheDocument();
      expect(screen.getByLabelText("Command + K")).toBeInTheDocument();
      expect(screen.queryByText("Ctrl")).not.toBeInTheDocument();
    });

    it("win forces Ctrl on a Mac user agent", () => {
      stubUserAgent(MAC_UA);
      const { container } = render(<Kbd platform="win" shortcut="mod+k" />);
      expect(screen.getByText("Ctrl")).toBeInTheDocument();
      expect(screen.getByLabelText("Ctrl + K")).toBeInTheDocument();
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });

    it("renders `meta` as the command icon on mac and Win on win", () => {
      stubUserAgent(WIN_UA);
      const mac = render(<Kbd platform="mac" shortcut="meta+k" />);
      expect(screen.getByRole("img", { name: "Command" })).toBeInTheDocument();
      mac.unmount();

      render(<Kbd platform="win" shortcut="meta+k" />);
      expect(screen.getByText("Win")).toBeInTheDocument();
    });

    it("keeps the other mac modifiers as text glyphs", () => {
      stubUserAgent(WIN_UA);
      const { container } = render(
        <Kbd platform="mac" shortcut="ctrl+alt+shift+k" />,
      );
      expect(screen.getByText("⌃")).toBeInTheDocument();
      expect(screen.getByText("⌥")).toBeInTheDocument();
      expect(screen.getByText("⇧")).toBeInTheDocument();
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });

    it("names the command icon in the wrapper label instead of the ⌘ glyph", () => {
      stubUserAgent(WIN_UA);
      const { container } = render(
        <Kbd platform="mac" shortcut="mod+shift+p" />,
      );
      expect(screen.getByLabelText("Command + ⇧ + P")).toBeInTheDocument();
      expect(container.textContent).not.toContain("⌘");
    });

    it("leaves explicit children untouched whatever the platform", () => {
      stubUserAgent(WIN_UA);
      render(<Kbd platform="mac">Ctrl</Kbd>);
      expect(screen.getByText("Ctrl").tagName).toBe("KBD");
    });
  });

  describe("variant", () => {
    it("default keeps the boxed key with token colours", () => {
      stubUserAgent(WIN_UA);
      render(<Kbd variant="default">K</Kbd>);
      const key = screen.getByText("K");
      expect(key).toHaveClass("border", "border-border", "bg-muted");
      expect(key.textContent).toBe("K");
    });

    it("is default when the prop is omitted", () => {
      stubUserAgent(WIN_UA);
      render(<Kbd>K</Kbd>);
      expect(screen.getByText("K")).toHaveClass("border-border", "bg-muted");
    });

    it("bracket wraps the key in decorative brackets and drops the box", () => {
      stubUserAgent(WIN_UA);
      const { container } = render(<Kbd variant="bracket">K</Kbd>);
      const key = container.querySelector("kbd");
      expect(key?.textContent).toBe("[K]");
      expect(key).not.toHaveClass("border", "bg-muted");
      const brackets = key?.querySelectorAll("span[aria-hidden='true']");
      expect(brackets).toHaveLength(2);
    });

    it("bracket keeps the shortcut label free of brackets", () => {
      stubUserAgent(WIN_UA);
      const { container } = render(<Kbd shortcut="ctrl+k" variant="bracket" />);
      expect(screen.getByLabelText("Ctrl + K")).toBeInTheDocument();
      expect(
        [...container.querySelectorAll("kbd")].map((key) => key.textContent),
      ).toEqual(["[Ctrl]", "[K]"]);
    });

    it("bracket works with the command icon", () => {
      stubUserAgent(WIN_UA);
      const { container } = render(
        <Kbd platform="mac" shortcut="mod+k" variant="bracket" />,
      );
      const keys = container.querySelectorAll("kbd");
      expect(keys[0]?.querySelector("svg")).toBeInTheDocument();
      expect(keys[0]?.textContent).toBe("[]");
      expect(keys[1]?.textContent).toBe("[K]");
    });

    it.each(["sm", "md", "lg"] as const)("bracket supports %s size", (size) => {
      stubUserAgent(WIN_UA);
      render(
        <Kbd size={size} variant="bracket">
          X
        </Kbd>,
      );
      expect(screen.getByText("X")).toBeInTheDocument();
    });
  });

  describe("backward compatibility", () => {
    it.each(["default", "bracket"] as const)(
      "forwards ref, className and rest props (%s)",
      (variant) => {
        stubUserAgent(WIN_UA);
        const ref = createRef<HTMLElement>();
        render(
          <Kbd
            className="custom"
            data-testid="key"
            ref={ref}
            title="Key"
            variant={variant}
          >
            K
          </Kbd>,
        );
        const key = screen.getByTestId("key");
        expect(ref.current).toBe(key);
        expect(key).toHaveClass("custom");
        expect(key).toHaveAttribute("title", "Key");
      },
    );

    it("still renders an empty kbd without children or shortcut", () => {
      stubUserAgent(WIN_UA);
      render(<Kbd data-testid="empty" />);
      expect(screen.getByTestId("empty").tagName).toBe("KBD");
      expect(screen.getByTestId("empty")).toBeEmptyDOMElement();
    });

    it.each(
      (["default", "bracket"] as const).flatMap((variant) =>
        (["sm", "md", "lg"] as const).map((size) => ({ size, variant })),
      ),
    )(
      "only uses design tokens for colour, never raw values ($variant, $size)",
      ({ size, variant }) => {
        const raw = /#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i;
        expect(kbdVariants({ size, variant })).not.toMatch(raw);
      },
    );
  });
});
