import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";

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

describe("Reasoning auto-expand frame", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cancels the pending frame on unmount", () => {
    const frames = stubAnimationFrame();
    const { unmount } = render(
      <Reasoning isStreaming steps={["Thinking hard"]} />,
    );
    expect(frames.pending()).toBe(1);

    unmount();

    expect(frames.pending()).toBe(0);
  });
});
