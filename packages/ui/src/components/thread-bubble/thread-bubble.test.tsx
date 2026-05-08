import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThreadBubble, type ThreadReply } from "./thread-bubble";

const REPLIES: ThreadReply[] = [
  {
    body: "We should reword this.",
    id: "1",
    timestamp: "2026-05-08T09:00:00Z",
    user: "Sam",
  },
  {
    body: "Agreed — drafting.",
    id: "2",
    user: "Wei",
  },
];

describe("ThreadBubble", () => {
  it("renders one row per reply", () => {
    const { container } = render(<ThreadBubble replies={REPLIES} />);

    expect(
      container.querySelector("[data-thread-reply-id='1']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-thread-reply-id='2']"),
    ).toBeInTheDocument();
  });

  it("emits the reply count via data-thread-replies", () => {
    const { container } = render(<ThreadBubble replies={REPLIES} />);

    expect(container.querySelector("[data-thread-replies]")).toHaveAttribute(
      "data-thread-replies",
      "2",
    );
  });

  it("renders the title when set", () => {
    render(<ThreadBubble replies={REPLIES} title="Trade-off summary" />);

    expect(screen.getByText("Trade-off summary")).toBeInTheDocument();
  });

  it("renders the Resolved pill when resolved is true", () => {
    const { container } = render(<ThreadBubble replies={REPLIES} resolved />);

    expect(
      container.querySelector("[data-thread-resolved]"),
    ).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  it("renders the compose placeholder when no compose slot is provided", () => {
    render(<ThreadBubble replies={REPLIES} />);

    expect(screen.getByText("Reply…")).toBeInTheDocument();
  });

  it("renders the provided compose slot", () => {
    render(
      <ThreadBubble
        composeSlot={<button type="button">Send</button>}
        replies={REPLIES}
      />,
    );

    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(screen.queryByText("Reply…")).toBeNull();
  });
});
