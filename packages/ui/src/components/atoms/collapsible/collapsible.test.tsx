import { fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

describe("Collapsible", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Collapsible className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("Collapsible Radix-compatible state", () => {
  const renderCollapsible = (
    props: React.ComponentProps<typeof Collapsible> = {},
  ) =>
    render(
      <Collapsible {...props}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>,
    );

  it("mirrors the open state in data-state on the root, trigger and content", () => {
    const { container } = renderCollapsible();
    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(container.firstChild).toHaveAttribute("data-state", "closed");
    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Body")).toBeNull();
    fireEvent.click(trigger);
    expect(container.firstChild).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Body")).toHaveAttribute("data-state", "open");
  });

  it("keeps forceMount content in the page while closed", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent forceMount>Body</CollapsibleContent>
      </Collapsible>,
    );
    const body = screen.getByText("Body", { selector: "[data-state]" });
    expect(body).toHaveAttribute("data-state", "closed");
    expect(body).not.toBeVisible();
  });

  it("aliases the Radix size variables on the content", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText("Body").className).toContain(
      "[--radix-collapsible-content-height:var(--collapsible-panel-height)]",
    );
  });
});
