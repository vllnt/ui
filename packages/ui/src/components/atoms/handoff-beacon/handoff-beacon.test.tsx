import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HandoffBeacon } from "./handoff-beacon";

describe("HandoffBeacon", () => {
  it("positions from x/y, emits the level, and omits the card without source or message", () => {
    const { container } = render(
      <HandoffBeacon level="urgent" x={120} y={80} />,
    );
    const beacon = container.querySelector("[data-handoff-level]");
    expect(beacon).toHaveStyle({ left: "120px", top: "80px" });
    expect(beacon).toHaveAttribute("data-handoff-level", "urgent");
    expect(container.querySelector("[data-handoff-card]")).toBeNull();
  });

  it("renders the source name and message together", () => {
    render(
      <HandoffBeacon
        message="Take this — schema mismatch"
        source="Sam"
        x={0}
        y={0}
      />,
    );
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Take this — schema mismatch")).toBeInTheDocument();
  });

  it("renders a message-only card when source is omitted", () => {
    const { container } = render(
      <HandoffBeacon message="Schema mismatch" x={0} y={0} />,
    );
    expect(container.querySelector("[data-handoff-card]")).toBeInTheDocument();
    expect(screen.getByText("Schema mismatch")).toBeInTheDocument();
  });
});
