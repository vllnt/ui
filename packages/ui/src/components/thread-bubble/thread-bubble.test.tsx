import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThreadBubble, type ThreadMessage } from "./thread-bubble";

const sample: ThreadMessage[] = [
  {
    author: "Bea",
    authorColor: "#5b8def",
    body: "Why fallback?",
    id: "1",
    ts: "12s",
  },
  {
    author: "Lior",
    authorColor: "#10b981",
    body: "p95 spike",
    id: "2",
    ts: "9s",
  },
];

describe("ThreadBubble", () => {
  it("renders one entry per message", () => {
    const { container } = render(<ThreadBubble messages={sample} />);

    expect(
      container.querySelectorAll("[data-thread-bubble-message]"),
    ).toHaveLength(2);
  });

  it("renders the empty state when there are no messages", () => {
    const { container } = render(<ThreadBubble messages={[]} />);

    expect(
      container.querySelector("[data-thread-bubble-state='empty']"),
    ).toBeInTheDocument();
  });

  it("renders the title when provided", () => {
    render(<ThreadBubble messages={sample} title="research-2025" />);

    expect(screen.getByText("research-2025")).toBeInTheDocument();
  });

  it("invokes onResolve when the resolve button is clicked", () => {
    const handleResolve = vi.fn();
    render(
      <ThreadBubble messages={sample} onResolve={handleResolve} title="x" />,
    );

    fireEvent.click(screen.getByText("Resolve"));
    expect(handleResolve).toHaveBeenCalledTimes(1);
  });

  it("hides the resolve button when no handler is provided", () => {
    render(<ThreadBubble messages={sample} />);

    expect(screen.queryByText("Resolve")).not.toBeInTheDocument();
  });

  it("applies the author color when provided", () => {
    const { container } = render(<ThreadBubble messages={sample} />);

    const author = container.querySelector("[data-thread-bubble-author]");
    expect(author).toHaveStyle({ color: "#5b8def" });
  });

  it("renders the footer slot when provided", () => {
    render(
      <ThreadBubble
        footer={<div data-testid="footer">reply</div>}
        messages={sample}
      />,
    );

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
