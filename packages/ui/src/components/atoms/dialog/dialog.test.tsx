import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const veil = (): Element | null => document.body.querySelector(".inset-0");

describe("Dialog", () => {
  it("renders the trigger but keeps content closed by default", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          Body
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("renders the content when defaultOpen is true and reports close via onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button">Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  describe("overlay", () => {
    const renderDialog = (
      overlay?: "none" | "scrim",
      onOpenChange?: (open: boolean) => void,
    ): HTMLElement => {
      const { container } = render(
        <div>
          <p>Page behind</p>
          <Dialog defaultOpen onOpenChange={onOpenChange}>
            <DialogContent overlay={overlay}>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogContent>
          </Dialog>
        </div>,
      );
      return container;
    };

    it("draws the scrim by default", () => {
      renderDialog();
      expect(veil()).toBeInTheDocument();
    });

    it("draws the scrim when overlay is scrim", () => {
      renderDialog("scrim");
      expect(veil()).toBeInTheDocument();
    });

    it("draws no veil when overlay is none, and the dialog stays modal", () => {
      const container = renderDialog("none");
      expect(veil()).not.toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(container).toHaveAttribute("aria-hidden", "true");
    });

    it("still closes on Escape when overlay is none", () => {
      const onOpenChange = vi.fn();
      renderDialog("none", onOpenChange);
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it.each<"none" | "scrim" | undefined>([undefined, "scrim", "none"])(
      "locks page scroll while the dialog is open with overlay %s",
      (overlay) => {
        renderDialog(overlay);
        expect(document.body).toHaveAttribute("data-scroll-locked");
      },
    );

    it.each<"none" | "scrim">(["scrim", "none"])(
      "releases the scroll lock when the dialog closes with overlay %s",
      async (overlay) => {
        renderDialog(overlay);
        expect(document.body).toHaveAttribute("data-scroll-locked");
        fireEvent.click(screen.getByText("Close"));
        await waitFor(() => {
          expect(document.body).not.toHaveAttribute("data-scroll-locked");
        });
      },
    );
  });
});
