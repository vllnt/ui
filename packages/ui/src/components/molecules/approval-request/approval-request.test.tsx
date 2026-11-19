import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ApprovalRequest,
  type ApprovalRequestPlacement,
  type ApprovalRequestRisk,
  type ApprovalRequestStatus,
} from "./approval-request";

const RISKS: readonly ApprovalRequestRisk[] = ["low", "medium", "high"];
const PLACEMENTS: readonly ApprovalRequestPlacement[] = [
  "inline",
  "hud",
  "dialog",
];
const STATUSES: readonly ApprovalRequestStatus[] = [
  "pending",
  "approved",
  "denied",
  "expired",
];
const RESOLVED: readonly ApprovalRequestStatus[] = [
  "approved",
  "denied",
  "expired",
];

const RISK_WORDS: Record<ApprovalRequestRisk, string> = {
  high: "High risk",
  low: "Low risk",
  medium: "Medium risk",
};
const STATUS_WORDS: Record<ApprovalRequestStatus, string> = {
  approved: "Approved",
  denied: "Denied",
  expired: "Expired",
  pending: "Pending",
};

function renderRequest(
  props: Partial<React.ComponentProps<typeof ApprovalRequest>> = {},
) {
  const onApprove = vi.fn();
  const onDeny = vi.fn();
  const view = render(
    <ApprovalRequest
      action="pnpm db:migrate"
      onApprove={onApprove}
      onDeny={onDeny}
      title="Run migration"
      {...props}
    />,
  );
  return { onApprove, onDeny, ...view };
}

describe("ApprovalRequest", () => {
  describe("pending", () => {
    it("renders Approve and Deny buttons that call their handlers", () => {
      const { onApprove, onDeny } = renderRequest();
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      expect(onApprove).toHaveBeenCalledTimes(1);
      expect(onDeny).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Deny" }));
      expect(onDeny).toHaveBeenCalledTimes(1);
      expect(onApprove).toHaveBeenCalledTimes(1);
    });

    it("renders buttons as type=button so a host form never submits", () => {
      renderRequest();
      expect(screen.getByRole("button", { name: "Approve" })).toHaveAttribute(
        "type",
        "button",
      );
      expect(screen.getByRole("button", { name: "Deny" })).toHaveAttribute(
        "type",
        "button",
      );
    });

    it("uses defaults when only the required props are passed", () => {
      renderRequest();
      expect(screen.getByText("Low risk")).toBeVisible();
      expect(screen.getByText("Pending")).toBeVisible();
      expect(screen.getByRole("button", { name: "Approve" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Deny" })).toBeVisible();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("disables the buttons and the checkbox with the disabled prop", () => {
      renderRequest({
        disabled: true,
        remember: { label: "Always allow this command" },
      });
      expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Deny" })).toBeDisabled();
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("resolved", () => {
    it.each(RESOLVED)("%s shows the status word and no buttons", (status) => {
      const { onApprove, onDeny } = renderRequest({ status });
      expect(screen.getByText(STATUS_WORDS[status])).toBeVisible();
      expect(screen.queryByText("Pending")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(onApprove).not.toHaveBeenCalled();
      expect(onDeny).not.toHaveBeenCalled();
    });

    it.each(RESOLVED)("%s hides the remember checkbox", (status) => {
      renderRequest({
        remember: { label: "Always allow this command" },
        status,
      });
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Always allow this command"),
      ).not.toBeInTheDocument();
    });
  });

  describe("words", () => {
    it.each(RISKS)("shows the %s risk word", (risk) => {
      renderRequest({ risk });
      expect(screen.getByText(RISK_WORDS[risk])).toBeVisible();
    });

    it("exposes the status word as a status region", () => {
      renderRequest({ status: "approved" });
      expect(screen.getByRole("status")).toHaveTextContent("Approved");
    });

    it.each(
      RISKS.flatMap((risk) =>
        STATUSES.flatMap((status) =>
          PLACEMENTS.map((placement) => ({ placement, risk, status })),
        ),
      ),
    )(
      "carries a risk word and a status word for $risk / $status / $placement",
      ({ placement, risk, status }) => {
        renderRequest({ placement, risk, status });
        const group = screen.getByRole("group", { name: "Run migration" });
        expect(group).toHaveTextContent(RISK_WORDS[risk]);
        expect(group).toHaveTextContent(STATUS_WORDS[status]);
      },
    );

    it("replaces the default words with the caller's labels", () => {
      renderRequest({
        labels: {
          approve: "Autoriser",
          deny: "Refuser",
          risk: { high: "Risque eleve" },
          status: { pending: "En attente" },
        },
        risk: "high",
      });
      expect(screen.getByText("Risque eleve")).toBeVisible();
      expect(screen.getByText("En attente")).toBeVisible();
      expect(screen.getByRole("button", { name: "Autoriser" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Refuser" })).toBeVisible();
    });

    it("keeps the default word for a label that is missing, empty or blank", () => {
      renderRequest({
        labels: {
          approve: "",
          deny: "   ",
          risk: {},
          status: { pending: "" },
        },
      });
      expect(screen.getByText("Low risk")).toBeVisible();
      expect(screen.getByText("Pending")).toBeVisible();
      expect(screen.getByRole("button", { name: "Approve" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Deny" })).toBeVisible();
    });

    it("keeps the default status word when only another status is customised", () => {
      renderRequest({
        labels: { status: { approved: "Allowed" } },
        status: "denied",
      });
      expect(screen.getByText("Denied")).toBeVisible();
      expect(screen.queryByText("Allowed")).not.toBeInTheDocument();
    });
  });

  describe("remember", () => {
    it("calls onCheckedChange and flips aria-checked when uncontrolled", () => {
      const onCheckedChange = vi.fn();
      renderRequest({
        remember: { label: "Always allow this command", onCheckedChange },
      });
      const checkbox = screen.getByRole("checkbox", {
        name: "Always allow this command",
      });
      expect(checkbox).toHaveAttribute("aria-checked", "false");
      fireEvent.click(checkbox);
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
      expect(checkbox).toHaveAttribute("aria-checked", "true");
      fireEvent.click(checkbox);
      expect(onCheckedChange).toHaveBeenLastCalledWith(false);
      expect(onCheckedChange).toHaveBeenCalledTimes(2);
    });

    it("follows the checked prop when controlled", () => {
      const onCheckedChange = vi.fn();
      renderRequest({
        remember: {
          checked: true,
          label: "Always allow this command",
          onCheckedChange,
        },
      });
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(onCheckedChange).toHaveBeenCalledWith(false);
      expect(checkbox).toBeChecked();
    });

    it("toggles from its label", () => {
      const onCheckedChange = vi.fn();
      renderRequest({
        remember: { label: "Always allow this command", onCheckedChange },
      });
      fireEvent.click(screen.getByText("Always allow this command"));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("does not throw when onCheckedChange is missing", () => {
      renderRequest({ remember: { label: "Always allow this command" } });
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("shows a default label when the label is blank", () => {
      renderRequest({ remember: { label: " " } });
      expect(
        screen.getByRole("checkbox", { name: "Remember my choice" }),
      ).toBeVisible();
    });
  });

  describe("structure", () => {
    it("labels the root group with the title", () => {
      renderRequest({ title: "Delete build output" });
      const group = screen.getByRole("group", { name: "Delete build output" });
      expect(group.tagName).toBe("FIELDSET");
      expect(group).toHaveAccessibleName("Delete build output");
    });

    it("renders the action in monospace and the optional detail", () => {
      renderRequest({
        action: "rm -rf ./dist",
        detail: "Removes the build output of the registry.",
      });
      expect(screen.getByText("rm -rf ./dist")).toHaveClass("font-mono");
      expect(
        screen.getByText("Removes the build output of the registry."),
      ).toBeVisible();
    });

    it("omits the detail paragraph when there is no detail", () => {
      const { container } = renderRequest();
      expect(container.querySelectorAll("p")).toHaveLength(1);
    });

    it("changes only the surface for each placement", () => {
      const classes = PLACEMENTS.map((placement) => {
        const { unmount } = renderRequest({ placement });
        const group = screen.getByRole("group");
        const value = group.className;
        expect(screen.getByRole("button", { name: "Approve" })).toBeVisible();
        unmount();
        return value;
      });
      expect(new Set(classes).size).toBe(PLACEMENTS.length);
      expect(classes[0]).toContain("bg-card");
      expect(classes[1]).toContain("max-w-sm");
      expect(classes[2]).toContain("max-w-lg");
    });

    it("merges className and passes the ref and other props to the root", () => {
      const reference = createRef<HTMLFieldSetElement>();
      renderRequest({
        className: "custom-class",
        id: "approval-root",
        ref: reference,
      });
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("id", "approval-root");
      expect(group).toHaveClass("custom-class");
      expect(group).toHaveClass("rounded-lg");
      expect(reference.current).toBe(group);
    });

    it("sets a display name", () => {
      expect(ApprovalRequest.displayName).toBe("ApprovalRequest");
    });
  });
});
