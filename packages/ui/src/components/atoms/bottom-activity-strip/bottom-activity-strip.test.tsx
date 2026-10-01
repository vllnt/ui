import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  type ActivityEvent,
  BottomActivityStrip,
} from "./bottom-activity-strip";

const sample: ActivityEvent[] = [
  { id: "1", label: "deploy ok", tone: "success", ts: "12s" },
  { id: "2", label: "queue spike", tone: "warn", ts: "1m" },
  { id: "3", label: "alert resolved", tone: "info", ts: "3m" },
];

describe("BottomActivityStrip", () => {
  it("renders the empty state when events list is empty", () => {
    const { container } = render(<BottomActivityStrip events={[]} />);
    expect(
      container.querySelector("[data-strip-state='empty']"),
    ).toBeInTheDocument();
    expect(screen.getByText("No recent activity")).toBeInTheDocument();
  });

  it("renders one plain chip per event with its tone", () => {
    const { container } = render(<BottomActivityStrip events={sample} />);
    expect(container.querySelectorAll("[data-strip-event]")).toHaveLength(3);
    expect(container.querySelector("[data-strip-event='1']")).toHaveAttribute(
      "data-strip-event-tone",
      "success",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("invokes onActivate when an interactive chip is clicked", () => {
    const handleActivate = vi.fn();
    render(
      <BottomActivityStrip
        events={[
          { id: "1", label: "click me", onActivate: handleActivate, ts: "now" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("respects maxEvents and drops the tail", () => {
    const { container } = render(
      <BottomActivityStrip events={sample} maxEvents={2} />,
    );
    expect(container.querySelectorAll("[data-strip-event]")).toHaveLength(2);
    expect(
      container.querySelector("[data-strip-event='3']"),
    ).not.toBeInTheDocument();
  });
});

describe("BottomActivityStrip keyboard access", () => {
  it("lets keyboard users focus the horizontally scrolling region", () => {
    render(<BottomActivityStrip events={[]} />);
    expect(screen.getByRole("region")).toHaveAttribute("tabindex", "0");
  });
});
