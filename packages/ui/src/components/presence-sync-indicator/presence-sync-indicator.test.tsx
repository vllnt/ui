import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PresenceSyncIndicator } from "./presence-sync-indicator";

describe("PresenceSyncIndicator", () => {
  it("renders the configured status label", () => {
    render(<PresenceSyncIndicator status="connected" />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("emits data-sync-status on the wrapper", () => {
    const { container } = render(
      <PresenceSyncIndicator status="reconnecting" />,
    );

    expect(container.querySelector("[data-sync-status]")).toHaveAttribute(
      "data-sync-status",
      "reconnecting",
    );
  });

  it("renders the detail string after the label", () => {
    render(<PresenceSyncIndicator detail="42 ms" status="connected" />);

    expect(screen.getByText("42 ms")).toBeInTheDocument();
  });

  it("hides the visible label when iconOnly is true and exposes it via sr-only", () => {
    const { container } = render(
      <PresenceSyncIndicator iconOnly status="offline" />,
    );

    const srOnly = container.querySelector(".sr-only");
    expect(srOnly).toHaveTextContent("Offline");
    expect(container.textContent?.trim()).toBe("Offline");
  });

  it("respects custom labels overrides", () => {
    render(
      <PresenceSyncIndicator
        labels={{ connected: "Linked", region: "Network" }}
        status="connected"
      />,
    );

    expect(screen.getByText("Linked")).toBeInTheDocument();
    expect(screen.getByLabelText("Network")).toBeInTheDocument();
  });
});
