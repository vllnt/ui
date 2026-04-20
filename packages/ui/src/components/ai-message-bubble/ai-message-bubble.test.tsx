import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIMessageBubble } from "./ai-message-bubble";

describe("AIMessageBubble", () => {
  it("renders message content and metadata", () => {
    render(
      <AIMessageBubble author="Assistant" status="sent" timestamp="Just now">
        Here is the answer you asked for.
      </AIMessageBubble>,
    );

    expect(screen.getByText("Assistant")).toBeVisible();
    expect(screen.getByText("sent")).toBeVisible();
    expect(screen.getByText("Here is the answer you asked for.")).toBeVisible();
  });

  it("aligns user messages to the end", () => {
    const { container } = render(
      <AIMessageBubble messageRole="user">
        Can you summarize this PR?
      </AIMessageBubble>,
    );

    expect(container.firstChild).toHaveClass("justify-end");
  });

  it("applies a custom className to the bubble", () => {
    const { container } = render(
      <AIMessageBubble className="custom-class">Styled bubble</AIMessageBubble>,
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
