import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type PresenceMember, PresenceStack } from "./presence-stack";

const MEMBERS: PresenceMember[] = [
  { color: "emerald", id: "sam", name: "Sam Smith" },
  { id: "riley", name: "Riley", status: "idle" },
  { color: "rose", id: "wei", name: "Wei" },
  { id: "jordan", name: "Jordan Doe" },
  { id: "alex", name: "Alex" },
];

describe("PresenceStack", () => {
  describe("rendering", () => {
    it("renders one chip per visible member up to max", () => {
      const { container } = render(<PresenceStack max={3} members={MEMBERS} />);

      expect(
        container.querySelector("[data-member-id='sam']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-member-id='riley']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-member-id='wei']"),
      ).toBeInTheDocument();
      expect(container.querySelector("[data-member-id='jordan']")).toBeNull();
    });

    it("renders an overflow chip when members exceed max", () => {
      const { container } = render(<PresenceStack max={3} members={MEMBERS} />);

      expect(container.querySelector("[data-overflow]")).toHaveAttribute(
        "data-overflow",
        "2",
      );
      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("emits the configured presence status on each chip", () => {
      const { container } = render(<PresenceStack members={MEMBERS} />);

      const riley = container.querySelector("[data-member-id='riley']");
      expect(riley).toHaveAttribute("data-presence-status", "idle");

      const sam = container.querySelector("[data-member-id='sam']");
      expect(sam).toHaveAttribute("data-presence-status", "active");
    });

    it("renders initials when no avatar source is set", () => {
      render(<PresenceStack members={[{ id: "sam", name: "Sam Smith" }]} />);

      expect(screen.getByText("SS")).toBeInTheDocument();
    });

    it("renders an avatar img when src is set", () => {
      const { container } = render(
        <PresenceStack
          members={[{ id: "sam", name: "Sam", src: "/sam.png" }]}
        />,
      );

      const image = container.querySelector("img");
      expect(image).toHaveAttribute("src", "/sam.png");
    });
  });

  describe("interaction", () => {
    it("fires onSelect with the picked member when clicked", () => {
      const onSelect = vi.fn();
      render(<PresenceStack members={MEMBERS} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole("button", { name: "Sam Smith" }));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: "sam" }),
      );
    });

    it("renders chips as plain spans (not buttons) when no onSelect is set", () => {
      const { container } = render(<PresenceStack members={MEMBERS} />);

      expect(container.querySelector("button")).toBeNull();
    });
  });
});
