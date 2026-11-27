import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlainSeparator } from "./plain-separator";
import { Separator } from "./separator";

const variants = ["solid", "dashed"] as const;
const orientations = ["horizontal", "vertical"] as const;

describe("PlainSeparator", () => {
  it.each(
    variants.flatMap((variant) =>
      orientations.flatMap((orientation) =>
        [true, false].map((decorative) => ({
          decorative,
          orientation,
          variant,
        })),
      ),
    ),
  )("renders the same markup as Separator: %o", (props) => {
    expect(
      renderToStaticMarkup(<PlainSeparator className="my-4" {...props} />),
    ).toBe(renderToStaticMarkup(<Separator className="my-4" {...props} />));
  });

  it("keeps a conflicting default instead of replacing it", () => {
    const { container } = render(<PlainSeparator className="bg-primary" />);
    expect(container.firstChild).toHaveClass("bg-border", "bg-primary");
    const merged = render(<Separator className="bg-primary" />).container;
    expect(merged.firstChild).not.toHaveClass("bg-border");
  });

  it("forwards ref and native attributes, and exposes the role when not decorative", () => {
    const ref = { current: null };
    render(
      <PlainSeparator
        data-testid="line"
        decorative={false}
        orientation="vertical"
        ref={ref}
      />,
    );
    const line = screen.getByRole("separator");
    expect(line).toBe(ref.current);
    expect(line).toHaveAttribute("aria-orientation", "vertical");
    expect(line).toHaveAttribute("data-testid", "line");
  });

  it("renders on the server", () => {
    expect(renderToStaticMarkup(<PlainSeparator />)).toContain(
      'aria-hidden="true"',
    );
  });
});
