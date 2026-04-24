import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorldClockBar } from "./world-clock-bar";

describe("WorldClockBar", () => {
  it("renders each timezone card", () => {
    render(
      <WorldClockBar
        now="2026-03-15T12:00:00.000Z"
        zones={[
          { city: "San Francisco", timeZone: "America/Los_Angeles" },
          { city: "London", timeZone: "Europe/London" },
        ]}
      />,
    );

    expect(screen.getByText("San Francisco")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("2 zones")).toBeInTheDocument();
  });
});
