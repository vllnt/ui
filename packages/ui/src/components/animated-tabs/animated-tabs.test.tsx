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
});
