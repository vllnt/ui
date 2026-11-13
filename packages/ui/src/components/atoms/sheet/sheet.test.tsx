import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  type SheetLabels,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

describe("Sheet", () => {
  it("renders the trigger but keeps content closed by default", () => {
    render(
      <Sheet>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Open sheet")).toBeInTheDocument();
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("renders the content when defaultOpen is true", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("supports the side variant prop", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="left">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });
});

function renderOpenSheet(labels?: SheetLabels) {
  return render(
    <Sheet defaultOpen>
      <SheetContent labels={labels}>
        <SheetTitle>Title</SheetTitle>
        <SheetDescription>Description</SheetDescription>
      </SheetContent>
    </Sheet>,
  );
}

describe("Sheet close button", () => {
  it("is a real button named Close inside the dialog, with a 24 px hit area and a focus ring", () => {
    renderOpenSheet();
    const dialog = screen.getByRole("dialog", { name: "Title" });
    const close = within(dialog).getByRole("button", { name: "Close" });

    expect(close.tagName).toBe("BUTTON");
    expect(close).toHaveAttribute("type", "button");
    expect(close).toHaveClass("size-6", "focus:ring-2", "focus:ring-ring");
  });

  it("keeps the 16 px icon inside the larger hit area", () => {
    renderOpenSheet();
    const icon = screen
      .getByRole("button", { name: "Close" })
      .querySelector("svg");

    expect(icon).toHaveClass("size-4");
  });

  it("uses a custom accessible name from labels.close", () => {
    renderOpenSheet({ close: "Fermer" });

    expect(screen.getByRole("button", { name: "Fermer" })).toHaveClass(
      "size-6",
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it.each<[string, SheetLabels]>([
    ["an empty labels object", {}],
    ["an undefined close label", { close: undefined }],
  ])("falls back to Close for %s", (_case, labels) => {
    renderOpenSheet(labels);

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("asks to close the sheet when clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet onOpenChange={onOpenChange} open>
        <SheetContent labels={{ close: "Fermer" }}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not forward labels to the dialog element", () => {
    renderOpenSheet({ close: "Fermer" });

    expect(screen.getByRole("dialog")).not.toHaveAttribute("labels");
  });
});
