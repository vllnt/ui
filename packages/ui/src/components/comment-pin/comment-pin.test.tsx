import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommentPin } from "./comment-pin";

describe("CommentPin", () => {
  it("positions the pin at the given coordinates", () => {
    const { container } = render(<CommentPin x={120} y={80} />);

    expect(container.querySelector("[data-comment-pin]")).toHaveStyle({
      left: "120px",
      top: "80px",
    });
  });

  it("renders the author initial", () => {
    render(<CommentPin authorInitial="B" x={0} y={0} />);

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders the unread badge when count is positive", () => {
    const { container } = render(<CommentPin unread={3} x={0} y={0} />);

    expect(
      container.querySelector("[data-comment-pin-unread]"),
    ).toHaveTextContent("3");
  });

  it("hides the unread badge when count is zero", () => {
    const { container } = render(<CommentPin unread={0} x={0} y={0} />);

    expect(
      container.querySelector("[data-comment-pin-unread]"),
    ).not.toBeInTheDocument();
  });

  it("invokes onActivate when the pin is clicked", () => {
    const handleActivate = vi.fn();
    render(<CommentPin onActivate={handleActivate} x={0} y={0} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("renders as a plain span when onActivate is omitted", () => {
    render(<CommentPin x={0} y={0} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("propagates state to a data attribute", () => {
    const { container } = render(<CommentPin state="resolved" x={0} y={0} />);

    expect(container.querySelector("[data-comment-pin]")).toHaveAttribute(
      "data-comment-pin-state",
      "resolved",
    );
  });
});
