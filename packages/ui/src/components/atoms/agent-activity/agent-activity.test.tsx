import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDuration,
  AgentStepProgress,
  AgentStepTitle,
} from "./agent-activity";

const activity = (
  step: ComponentProps<typeof AgentStep>,
  extra?: ReactNode,
  props?: ComponentProps<typeof AgentActivity>,
) => (
  <AgentActivity {...props}>
    <AgentStep {...step}>
      <AgentStepTitle>Step</AgentStepTitle>
      {extra}
    </AgentStep>
  </AgentActivity>
);

const collapsedWithDetail = (props?: ComponentProps<typeof AgentActivity>) =>
  activity(
    { defaultOpen: false, status: "completed" },
    <AgentStepDetail>Hidden detail</AgentStepDetail>,
    props,
  );

describe("AgentActivity", () => {
  it("renders the activity heading and steps", () => {
    render(
      <AgentActivity status="running">
        <AgentStep status="completed">
          <AgentStepTitle>Searching codebase</AgentStepTitle>
        </AgentStep>
        <AgentStep status="running">
          <AgentStepTitle>Writing fix</AgentStepTitle>
        </AgentStep>
      </AgentActivity>,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Activity" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Searching codebase")).toBeInTheDocument();
    expect(screen.getByText("Writing fix")).toBeInTheDocument();
  });

  it("renders the elapsed time and aria-live=polite while running", () => {
    const { container } = render(
      activity({ status: "pending" }, null, {
        elapsed: "3.2s",
        status: "running",
      }),
    );
    expect(screen.getByLabelText("Elapsed")).toHaveTextContent("3.2s");
    expect(container.querySelector("section")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("uses aria-live=off when idle", () => {
    const { container } = render(
      activity({ status: "pending" }, null, { status: "idle" }),
    );
    expect(container.querySelector("section")).toHaveAttribute(
      "aria-live",
      "off",
    );
  });

  it.each(["pending", "running", "completed", "error", "skipped"] as const)(
    "renders status=%s with the data attribute set",
    (status) => {
      render(activity({ status }));
      expect(screen.getByText("Step").closest("li")).toHaveAttribute(
        "data-status",
        status,
      );
    },
  );

  it("renders duration alongside the title without a details toggle", () => {
    render(
      activity(
        { status: "completed" },
        <AgentStepDuration>1.2s</AgentStepDuration>,
      ),
    );
    expect(screen.getByText("1.2s")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /details/ }),
    ).not.toBeInTheDocument();
  });

  it("collapses details when defaultOpen is false, keeping aria-controls valid", () => {
    render(collapsedWithDetail());
    expect(screen.getByText("Hidden detail")).not.toBeVisible();
    const toggle = screen.getByRole("button", { name: "Show details" });
    const controlledId = toggle.getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();
    expect(
      document.querySelector(`[id="${controlledId ?? ""}"]`),
    ).not.toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText("Hidden detail")).toBeVisible();
  });

  it("propagates AgentActivity labels to the step toggle", () => {
    render(
      collapsedWithDetail({
        labels: { collapse: "Masquer", expand: "Voir les détails" },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Voir les détails" }));
    expect(screen.getByRole("button", { name: "Masquer" })).toBeInTheDocument();
  });

  it("AgentStepProgress emits aria-valuenow clamped to 0–100", () => {
    const { rerender } = render(
      activity({ status: "running" }, <AgentStepProgress value={150} />),
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    rerender(
      activity({ status: "running" }, <AgentStepProgress value={-20} />),
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });
});
