import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FollowMode } from "./follow-mode";

describe("FollowMode", () => {
  it("emits the configured color via data-follow-color", () => {
    const { container } = render(
      <FollowMode color="emerald" name="Sam">
        <p>Body</p>
      </FollowMode>,
    );

    expect(container.querySelector("[data-follow-color]")).toHaveAttribute(
      "data-follow-color",
      "emerald",
    );
  });

  it("renders the participant name in the chip", () => {
    render(
      <FollowMode name="Sam">
        <p>Body</p>
      </FollowMode>,
    );

    expect(screen.getByText(/Following Sam/)).toBeInTheDocument();
  });

  it("renders the stop button only when onStop is set", () => {
    const onStop = vi.fn();
    const { rerender } = render(
      <FollowMode name="Sam">
        <p>Body</p>
      </FollowMode>,
    );

    expect(screen.queryByRole("button", { name: "Stop" })).toBeNull();

    rerender(
      <FollowMode name="Sam" onStop={onStop}>
        <p>Body</p>
      </FollowMode>,
    );

    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
  });

  it("fires onStop when the stop button is clicked", () => {
    const onStop = vi.fn();
    render(
      <FollowMode name="Sam" onStop={onStop}>
        <p>Body</p>
      </FollowMode>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("renders children inside the wrapper", () => {
    render(
      <FollowMode name="Sam">
        <p>Inner content</p>
      </FollowMode>,
    );

    expect(screen.getByText("Inner content")).toBeInTheDocument();
  });
});
