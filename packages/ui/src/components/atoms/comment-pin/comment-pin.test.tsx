import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommentPin } from "./comment-pin";

describe("CommentPin", () => {
  it("renders a positioned plain pin with initial, unread badge, and state", () => {
    const { container } = render(
      <CommentPin
        authorInitial="B"
        state="resolved"
        unread={3}
        x={120}
        y={80}
      />,
    );
    const pin = container.querySelector("[data-comment-pin]");
    expect(pin).toHaveStyle({ left: "120px", top: "80px" });
    expect(pin).toHaveAttribute("data-comment-pin-state", "resolved");
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(
      container.querySelector("[data-comment-pin-unread]"),
    ).toHaveTextContent("3");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
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
});

describe("CommentPin semantics", () => {
  it("is a single named button when interactive, without an img wrapper", () => {
    render(<CommentPin onActivate={vi.fn()} unread={3} x={0} y={0} />);
    expect(
      screen.getByRole("button", { name: "Comment, 3 unread" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("is a named image when static", () => {
    render(<CommentPin x={0} y={0} />);
    expect(screen.getByRole("img", { name: "Comment" })).toBeInTheDocument();
  });
});
