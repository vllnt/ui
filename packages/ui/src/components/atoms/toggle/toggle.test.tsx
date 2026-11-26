import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Toggle, toggleVariants } from "./toggle";

describe("Toggle", () => {
  it("applies custom className", () => {
    const { container } = render(<Toggle className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it.each(["default", "lg", "sm"] as const)("renders %s size", (size) => {
    const { container } = render(<Toggle size={size} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it.each(["default", "outline"] as const)("renders %s variant", (variant) => {
    const { container } = render(<Toggle variant={variant} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("forwards ref to DOM element", () => {
    const ref = { current: null };
    render(<Toggle ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is visible when rendered", () => {
    const { container } = render(<Toggle />);
    expect(container.firstChild).toBeVisible();
  });
});

describe("Toggle Radix-compatible state", () => {
  it("mirrors the pressed state in data-state as on and off", () => {
    render(<Toggle aria-label="Bold" />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("data-state", "off");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "on");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("reports the new state through onPressedChange", () => {
    const handlePressed = vi.fn();
    render(<Toggle aria-label="Bold" onPressedChange={handlePressed} />);
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(handlePressed).toHaveBeenCalledWith(true, expect.anything());
  });

  it("renders the child element when asChild is set", () => {
    render(
      <Toggle asChild>
        <a href="/bold">Bold</a>
      </Toggle>,
    );
    const link = screen.getByRole("link", { name: "Bold" });
    expect(link).toHaveAttribute("data-state", "off");
    expect(screen.queryByRole("button")).toBeNull();
  });

  describe('variant="unstyled"', () => {
    it("renders only the caller's classes and keeps the pressed state", () => {
      const onPressedChange = vi.fn();
      render(
        <Toggle
          aria-label="Bold"
          className="chip"
          onPressedChange={onPressedChange}
          size="lg"
          variant="unstyled"
        />,
      );
      const toggle = screen.getByRole("button", { name: "Bold" });
      expect(toggle.className).toBe("chip");
      expect(toggle).toHaveAttribute("aria-pressed", "false");
      expect(toggle).toHaveAttribute("data-state", "off");
      fireEvent.click(toggle);
      expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
      expect(toggle).toHaveAttribute("aria-pressed", "true");
      expect(toggle).toHaveAttribute("data-state", "on");
    });

    it("renders no class attribute without a className", () => {
      render(<Toggle aria-label="Bold" variant="unstyled" />);
      expect(screen.getByRole("button")).not.toHaveAttribute("class");
    });

    it("gives toggleVariants no classes of its own", () => {
      expect(toggleVariants({ variant: "unstyled" })).toBe("");
      expect(
        toggleVariants({ className: "a", size: "sm", variant: "unstyled" }),
      ).toBe("a");
      expect(toggleVariants()).toContain("data-[state=on]:bg-accent");
    });
  });

  it("keeps accepting null in toggleVariants, as cva did", () => {
    expect(Reflect.apply(toggleVariants, undefined, [null])).toBe(
      toggleVariants(),
    );
  });
});
