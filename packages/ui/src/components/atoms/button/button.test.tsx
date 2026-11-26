import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders a visible button that merges className and forwards ref", () => {
    const ref = { current: null };
    render(
      <Button className="custom-class" ref={ref}>
        Test
      </Button>,
    );
    expect(screen.getByRole("button")).toBeVisible();
    expect(screen.getByRole("button")).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it.each([
    ...(["default", "icon", "icon-lg", "lg", "sm"] as const).map((size) => ({
      size,
    })),
    ...(
      [
        "default",
        "destructive",
        "ghost",
        "link",
        "outline",
        "secondary",
      ] as const
    ).map((variant) => ({ variant })),
  ])("renders %o", (props) => {
    render(<Button {...props}>Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("sizes icon as 40 px and icon-lg as a 44 px square", () => {
    const { rerender } = render(<Button size="icon">I</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-10");
    rerender(<Button size="icon-lg">I</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-11");
    expect(buttonVariants({ size: "icon-lg" })).toContain("size-11");
  });

  it("keeps the styled class list byte for byte", () => {
    expect(buttonVariants()).toBe(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
    );
    expect(
      buttonVariants({ className: "x", size: "sm", variant: "ghost" }),
    ).toBe(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground x",
    );
    expect(buttonVariants({ class: "y", variant: "outline" })).toMatch(/ y$/);
    expect(buttonVariants(null)).toBe(buttonVariants());
  });

  describe('variant="unstyled"', () => {
    it("renders only the caller's classes, whatever the size", () => {
      render(
        <Button className="game-key p-2" size="lg" variant="unstyled">
          A
        </Button>,
      );
      expect(screen.getByRole("button").className).toBe("game-key p-2");
    });

    it("renders no class attribute without a className", () => {
      render(<Button variant="unstyled">A</Button>);
      expect(screen.getByRole("button")).not.toHaveAttribute("class");
    });

    it("keeps the button behaviour: ref, attributes, disabled and asChild", () => {
      const ref = { current: null };
      const onClick = vi.fn();
      const { rerender } = render(
        <Button
          aria-label="Play"
          onClick={onClick}
          ref={ref}
          type="submit"
          variant="unstyled"
        >
          A
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Play" });
      expect(ref.current).toBe(button);
      expect(button).toHaveAttribute("type", "submit");
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);

      rerender(
        <Button disabled onClick={onClick} variant="unstyled">
          A
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("button")).toBeDisabled();
      expect(onClick).toHaveBeenCalledTimes(1);

      rerender(
        <Button asChild className="nav" variant="unstyled">
          <a href="/play">Play</a>
        </Button>,
      );
      expect(screen.getByRole("link", { name: "Play" }).className).toBe("nav");
    });

    it("gives buttonVariants no classes of its own", () => {
      expect(buttonVariants({ variant: "unstyled" })).toBe("");
      expect(
        buttonVariants({ className: "a", size: "icon", variant: "unstyled" }),
      ).toBe("a");
    });
  });
});
