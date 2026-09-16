import { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout, CalloutBody, CalloutHeader } from "./callout";

describe("Callout", () => {
  it.each([
    ["danger", "Danger", "red"],
    ["info", "Info", "blue"],
    ["note", "Note", "gray"],
    ["success", "Success", "green"],
    ["tip", "Tip", "amber"],
    ["warning", "Warning", "orange"],
  ] satisfies [
    "danger" | "info" | "note" | "success" | "tip" | "warning",
    string,
    string,
  ][])("preserves legacy %s", (variant, title, color) => {
    render(
      <Callout icon={<span data-testid="icon" />} variant={variant}>
        Content
      </Callout>,
    );
    expect(screen.getByRole("alert")).toHaveClass(
      "my-6",
      "border-l-4",
      `bg-${color}-500/10`,
    );
    expect(screen.getByText(title)).toHaveClass("font-semibold", "mb-1");
    expect(screen.getByText("Content")).toHaveClass("text-sm");
    expect(screen.getByTestId("icon").parentElement).toHaveClass("size-5");
  });

  it("defaults to info and preserves custom and empty titles", () => {
    const { rerender } = render(<Callout>Content</Callout>);
    expect(screen.getByText("Info")).toBeVisible();
    rerender(<Callout title="Custom">Content</Callout>);
    expect(screen.getByText("Custom")).toBeVisible();
    rerender(<Callout title="">Content</Callout>);
    expect(screen.queryByText("Info")).not.toBeInTheDocument();
    expect(screen.queryByText("Custom")).not.toBeInTheDocument();
  });

  it("uses semantic neutral tokens without changing the legacy layout", () => {
    render(<Callout variant="neutral">Content</Callout>);
    expect(screen.getByRole("alert")).toHaveClass(
      "border-border",
      "bg-muted",
      "text-foreground",
    );
    expect(screen.getByText("Content")).toHaveClass("text-sm");
  });

  it("opts into direct composition without injected titles, icons, or typography", () => {
    const rootRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLElement>();
    const bodyRef = createRef<HTMLDivElement>();
    render(
      <Callout
        aria-label="Notice"
        className="custom"
        composable
        icon={<span>Ignored icon</span>}
        ref={rootRef}
        title="Ignored"
      >
        <CalloutHeader className="header-custom" id="heading" ref={headerRef}>
          <h2>Heading</h2>
        </CalloutHeader>
        <CalloutBody
          aria-labelledby="heading"
          className="body-custom"
          ref={bodyRef}
        >
          <p>Body</p>
        </CalloutBody>
      </Callout>,
    );
    expect(rootRef.current).toBe(screen.getByRole("alert"));
    expect(rootRef.current).toHaveClass("custom");
    expect(rootRef.current).toHaveAttribute("aria-label", "Notice");
    expect(rootRef.current?.children).toHaveLength(2);
    expect(headerRef.current?.tagName).toBe("HEADER");
    expect(headerRef.current?.parentElement).toBe(rootRef.current);
    expect(bodyRef.current?.parentElement).toBe(rootRef.current);
    expect(headerRef.current).toHaveClass("header-custom");
    expect(bodyRef.current).toHaveClass("body-custom");
    expect(bodyRef.current).toHaveAttribute("aria-labelledby", "heading");
    expect(headerRef.current?.className).not.toMatch(
      /text-|font-|leading-|tracking-/,
    );
    expect(bodyRef.current?.className).not.toMatch(
      /text-|font-|leading-|tracking-/,
    );
    expect(screen.queryByText("Info")).not.toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Ignored icon")).not.toBeInTheDocument();
  });

  it("allows native role overrides", () => {
    render(
      <Callout composable role="note">
        Static note
      </Callout>,
    );
    expect(screen.getByRole("note")).toBeVisible();
  });
});
