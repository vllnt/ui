import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDuration,
  AgentStepProgress,
  AgentStepTitle,
} from "./agent-activity";

describe("AgentActivity", () => {
  describe("rendering", () => {
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

    it("renders the elapsed time when provided", () => {
      render(
        <AgentActivity elapsed="3.2s" status="running">
          <AgentStep status="running">
            <AgentStepTitle>Step</AgentStepTitle>
          </AgentStep>
        </AgentActivity>,
      );

      expect(screen.getByLabelText("Elapsed")).toHaveTextContent("3.2s");
    });

    it("uses aria-live=polite while running", () => {
      const { container } = render(
        <AgentActivity status="running">
          <AgentStep status="pending">
            <AgentStepTitle>Step</AgentStepTitle>
          </AgentStep>
        </AgentActivity>,
      );

      expect(container.querySelector("section")).toHaveAttribute(
        "aria-live",
        "polite",
      );
    });

    it("uses aria-live=off when idle", () => {
      const { container } = render(
        <AgentActivity status="idle">
          <AgentStep status="pending">
            <AgentStepTitle>Step</AgentStepTitle>
          </AgentStep>
        </AgentActivity>,
      );

      expect(container.querySelector("section")).toHaveAttribute(
        "aria-live",
        "off",
      );
    });
  });

  describe("AgentStep", () => {
    it.each(["pending", "running", "completed", "error", "skipped"] as const)(
      "renders status=%s with the data attribute set",
      (status) => {
        render(
          <AgentActivity>
            <AgentStep status={status}>
              <AgentStepTitle>Title</AgentStepTitle>
            </AgentStep>
          </AgentActivity>,
        );

        const item = screen.getByText("Title").closest("li");
        expect(item).toHaveAttribute("data-status", status);
      },
    );

    it("renders duration alongside the title", () => {
      render(
        <AgentActivity>
          <AgentStep status="completed">
            <AgentStepTitle>Searching</AgentStepTitle>
            <AgentStepDuration>1.2s</AgentStepDuration>
          </AgentStep>
        </AgentActivity>,
      );

      expect(screen.getByText("1.2s")).toBeInTheDocument();
    });

    it("collapses the toggle and details when defaultOpen is false", () => {
      render(
        <AgentActivity>
          <AgentStep defaultOpen={false} status="completed">
            <AgentStepTitle>Step</AgentStepTitle>
            <AgentStepDetail>Hidden detail</AgentStepDetail>
          </AgentStep>
        </AgentActivity>,
      );

      expect(screen.queryByText("Hidden detail")).not.toBeInTheDocument();
      const toggle = screen.getByRole("button", { name: "Show details" });
      fireEvent.click(toggle);
      expect(screen.getByText("Hidden detail")).toBeInTheDocument();
    });

    it("does not render the toggle when there are no details", () => {
      render(
        <AgentActivity>
          <AgentStep status="completed">
            <AgentStepTitle>Step</AgentStepTitle>
          </AgentStep>
        </AgentActivity>,
      );

      expect(
        screen.queryByRole("button", { name: /details/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("AgentStepProgress", () => {
    it("emits aria-valuenow clamped to 0–100", () => {
      const { rerender } = render(
        <AgentActivity>
          <AgentStep status="running">
            <AgentStepTitle>Step</AgentStepTitle>
            <AgentStepProgress value={150} />
          </AgentStep>
        </AgentActivity>,
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "100",
      );

      rerender(
        <AgentActivity>
          <AgentStep status="running">
            <AgentStepTitle>Step</AgentStepTitle>
            <AgentStepProgress value={-20} />
          </AgentStep>
        </AgentActivity>,
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    });
  });
});
