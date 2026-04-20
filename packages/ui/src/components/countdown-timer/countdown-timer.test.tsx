import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountdownTimer } from "./countdown-timer";

describe("CountdownTimer", () => {
  it("renders an on track countdown with segments", () => {
    render(
      <CountdownTimer
        deadline="2026-03-15T10:30:00.000Z"
        now="2026-03-15T10:00:00.000Z"
        title="SLA timer"
      />,
    );

    expect(screen.getByText("SLA timer")).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
    expect(screen.getByText("Days")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Time remaining")).toBeInTheDocument();
  });

  it("shows breached when the deadline has passed", () => {
    render(
      <CountdownTimer
        deadline="2026-03-15T10:00:00.000Z"
        now="2026-03-15T10:05:00.000Z"
      />,
    );

    expect(screen.getByText("Breached")).toBeInTheDocument();
  });
});
