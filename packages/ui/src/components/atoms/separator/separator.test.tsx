import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("applies custom className", () => {
    const { container } = render(<Separator className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards ref to DOM element", () => {
    const ref = { current: null };
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is visible when rendered", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeVisible();
  });

  it("is decorative by default: hidden from assistive tech, no separator role", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("exposes role and orientation when not decorative", () => {
    const { rerender } = render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    expect(screen.getByRole("separator")).not.toHaveAttribute("aria-hidden");
    rerender(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("draws a solid 1 px line by default in both orientations", () => {
    const { container, rerender } = render(<Separator />);
    expect(container.firstChild).toHaveClass("bg-border", "h-[1px]", "w-full");
    expect(container.firstChild).not.toHaveClass("border-dashed");
    rerender(<Separator orientation="vertical" />);
    expect(container.firstChild).toHaveClass("bg-border", "h-full", "w-[1px]");
    expect(container.firstChild).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("draws a dashed border over a transparent fill in both orientations", () => {
    const { container, rerender } = render(<Separator variant="dashed" />);
    expect(container.firstChild).toHaveClass(
      "border-t",
      "border-dashed",
      "border-border",
      "w-full",
    );
    expect(container.firstChild).not.toHaveClass("bg-border");
    rerender(<Separator orientation="vertical" variant="dashed" />);
    expect(container.firstChild).toHaveClass(
      "border-l",
      "border-dashed",
      "border-border",
      "h-full",
    );
    expect(container.firstChild).not.toHaveClass("bg-border");
  });

  it("renders on the server without client-only APIs", () => {
    const markup = renderToStaticMarkup(
      <Separator decorative={false} variant="dashed" />,
    );
    expect(markup).toContain('role="separator"');
    expect(markup).toContain("border-dashed");
  });
});
