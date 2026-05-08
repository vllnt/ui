import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorldBreadcrumbs, type WorldCrumb } from "./world-breadcrumbs";

const CRUMBS: WorldCrumb[] = [
  { id: "ws", label: "Acme" },
  { id: "proj", label: "Q4 launch" },
  { id: "view", label: "Release timeline" },
];

describe("WorldBreadcrumbs", () => {
  describe("rendering", () => {
    it("renders one crumb per entry", () => {
      const { container } = render(<WorldBreadcrumbs crumbs={CRUMBS} />);

      expect(
        container.querySelector("[data-crumb-id='ws']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-crumb-id='proj']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-crumb-id='view']"),
      ).toBeInTheDocument();
    });

    it("marks the trailing crumb as current", () => {
      const { container } = render(<WorldBreadcrumbs crumbs={CRUMBS} />);

      expect(container.querySelector("[data-crumb-id='view']")).toHaveAttribute(
        "data-crumb-current",
        "true",
      );
      expect(
        container.querySelector("[data-crumb-id='ws']"),
      ).not.toHaveAttribute("data-crumb-current");
    });

    it("emits crumb depth on the wrapper", () => {
      const { container } = render(<WorldBreadcrumbs crumbs={CRUMBS} />);

      expect(container.querySelector("nav")).toHaveAttribute(
        "data-crumbs-depth",
        "3",
      );
    });

    it("renders a separator between crumbs", () => {
      const { container } = render(
        <WorldBreadcrumbs crumbs={CRUMBS} separator="›" />,
      );

      const separators = container.querySelectorAll("[aria-hidden='true']");
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("interaction", () => {
    it("fires onNavigate when an ancestor crumb is clicked", () => {
      const onNavigate = vi.fn();
      render(<WorldBreadcrumbs crumbs={CRUMBS} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByText("Q4 launch"));
      expect(onNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ id: "proj" }),
      );
    });

    it("does not fire onNavigate when the current crumb is clicked", () => {
      const onNavigate = vi.fn();
      render(<WorldBreadcrumbs crumbs={CRUMBS} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByText("Release timeline"));
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it("renders an anchor when href is set", () => {
      render(
        <WorldBreadcrumbs
          crumbs={[
            { href: "/acme", id: "ws", label: "Acme" },
            { id: "view", label: "Now" },
          ]}
        />,
      );

      expect(screen.getByText("Acme").closest("a")).toHaveAttribute(
        "href",
        "/acme",
      );
    });
  });
});
