import { fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <RadioGroup className="custom-class" ref={ref} />,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("RadioGroup Radix-compatible API", () => {
  const renderGroup = (props: React.ComponentProps<typeof RadioGroup> = {}) =>
    render(
      <RadioGroup aria-label="Plan" {...props}>
        <RadioGroupItem aria-label="Free" value="free" />
        <RadioGroupItem aria-label="Pro" value="pro" />
      </RadioGroup>,
    );

  it("mirrors the checked state in data-state on the items", () => {
    renderGroup({ defaultValue: "free" });
    const free = screen.getByRole("radio", { name: "Free" });
    const pro = screen.getByRole("radio", { name: "Pro" });
    expect(free).toHaveAttribute("data-state", "checked");
    expect(pro).toHaveAttribute("data-state", "unchecked");
    fireEvent.click(pro);
    expect(free).toHaveAttribute("data-state", "unchecked");
    expect(pro).toHaveAttribute("data-state", "checked");
  });

  it("calls onValueChange with the chosen string", () => {
    const handleChange = vi.fn();
    renderGroup({ onValueChange: handleChange });
    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("pro");
  });

  it("names its orientation for assistive tech and styling", () => {
    renderGroup({ orientation: "horizontal" });
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toHaveAttribute("aria-orientation", "horizontal");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
  });
});
