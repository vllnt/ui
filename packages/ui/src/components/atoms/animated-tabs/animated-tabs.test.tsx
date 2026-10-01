import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnimatedTabs } from "./animated-tabs";

const tabs = [
  { label: "One", value: "one" },
  { label: "Two", value: "two" },
];

describe("AnimatedTabs", () => {
  it("renders its tabs and merges className", () => {
    const { container } = render(
      <AnimatedTabs className="custom-class" tabs={tabs} />,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("calls onValueChange when a tab is selected", () => {
    const onValueChange = vi.fn();
    render(<AnimatedTabs onValueChange={onValueChange} tabs={tabs} />);
    fireEvent.click(screen.getByText("Two"));
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("keeps a single tab stop on the active tab", () => {
    render(<AnimatedTabs defaultValue="two" tabs={tabs} />);
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("moves focus and selection with arrow keys, Home and End (APG tabs)", () => {
    const onValueChange = vi.fn();
    render(
      <AnimatedTabs
        onValueChange={onValueChange}
        tabs={[...tabs, { label: "Three", value: "three" }]}
      />,
    );
    const one = screen.getByRole("tab", { name: "One" });
    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    const two = screen.getByRole("tab", { name: "Two" });
    expect(two).toHaveFocus();
    expect(two).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("two");
    fireEvent.keyDown(two, { key: "End" });
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Three" }), {
      key: "ArrowRight",
    });
    expect(one).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("one");
  });
});
