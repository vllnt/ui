import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIStreamingText } from "./ai-streaming-text";

describe("AIStreamingText", () => {
  it("renders the streamed text", () => {
    render(<AIStreamingText text="Streaming response" />);

    expect(screen.getByText("Streaming response")).toBeVisible();
  });

  it("shows a cursor and live region while streaming", () => {
    render(<AIStreamingText isStreaming={true} text="Still typing" />);

    expect(screen.getByText("▍")).toBeVisible();
    expect(screen.getByText(/Still typing/)).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("applies a custom className", () => {
    const { container } = render(
      <AIStreamingText className="custom-class" text="Styled response" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
