import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";

import { ThinkingBlock } from "./thinking-block";

describe("ThinkingBlock", () => {
  it("applies custom className", () => {
    const { container } = render(<ThinkingBlock className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<ThinkingBlock />);
    expect(container.firstChild).toBeVisible();
  });
});

describe("ThinkingBlock auto-expand frame", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cancels the pending frame on unmount", () => {
    const frames = stubAnimationFrame();
    const { unmount } = render(
      <ThinkingBlock isStreaming thinking="Working it out" />,
    );
    expect(frames.pending()).toBe(1);

    unmount();

    expect(frames.pending()).toBe(0);
  });
});
