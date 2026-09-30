import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Reasoning } from "./reasoning";

describe("Reasoning", () => {
  it("merges className, is collapsed by default and expands on toggle", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Reasoning
        className="custom-class"
        onOpenChange={onOpenChange}
        steps={["Parse the request"]}
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(screen.queryByText("Parse the request")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Parse the request")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("auto-expands while streaming", () => {
    render(<Reasoning isStreaming steps={["Thinking hard"]} />);
    expect(screen.getByText("Thinking hard")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("renders free-form children when no steps are provided", () => {
    render(<Reasoning isStreaming>Free-form reasoning text</Reasoning>);
    expect(screen.getByText("Free-form reasoning text")).toBeInTheDocument();
  });
});
