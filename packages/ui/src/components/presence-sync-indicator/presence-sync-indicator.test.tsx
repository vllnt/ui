import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PresenceSyncIndicator } from "./presence-sync-indicator";

describe("PresenceSyncIndicator", () => {
  it("renders the humanized state label by default", () => {
    render(<PresenceSyncIndicator state="live" />);

    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("uses the override label when provided", () => {
    render(<PresenceSyncIndicator label="Connected" state="live" />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("propagates state to a data attribute", () => {
    const { container } = render(
      <PresenceSyncIndicator state="reconnecting" />,
    );

    expect(container.querySelector("[data-presence-sync]")).toHaveAttribute(
      "data-presence-state",
      "reconnecting",
    );
  });

  it("renders the status line when provided", () => {
    render(<PresenceSyncIndicator state="live" status="3 peers" />);

    expect(screen.getByText("3 peers")).toBeInTheDocument();
  });

  it("includes the human state in the aria-label", () => {
    render(<PresenceSyncIndicator state="offline" />);

    expect(screen.getByLabelText("Presence sync: Offline")).toBeInTheDocument();
  });

  it("animates the dot for transient states", () => {
    const { container } = render(<PresenceSyncIndicator state="syncing" />);

    const dot = container.querySelector("[data-presence-sync-dot]");
    expect(dot?.getAttribute("class")).toContain("animate-pulse");
  });
});
