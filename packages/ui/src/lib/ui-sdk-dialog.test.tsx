import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../components/atoms/dialog/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "../components/atoms/drawer/drawer";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "../components/atoms/sheet/sheet";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/molecules/alert-dialog/alert-dialog";

import { openAliases } from "./ui-sdk-dialog";

describe("openAliases", () => {
  it("reads isOpen when open is not given, and closed when neither is", () => {
    expect(openAliases({ isOpen: true }).open).toBe(true);
    expect(openAliases({}).open).toBe(false);
  });

  it("prefers open over isOpen", () => {
    expect(openAliases({ isOpen: true, open: false }).open).toBe(false);
  });

  it("calls onOpenChange on every change and onClose only on a close", () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    const { handleOpenChange: change } = openAliases({ onClose, onOpenChange });

    change(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(onClose).not.toHaveBeenCalled();

    change(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("createDialogParts", () => {
  it.each([
    [
      "Dialog",
      Dialog,
      [
        DialogTrigger,
        DialogClose,
        DialogPortal,
        DialogOverlay,
        DialogHeader,
        DialogFooter,
        DialogTitle,
        DialogDescription,
      ],
    ],
    [
      "Sheet",
      Sheet,
      [
        SheetTrigger,
        SheetClose,
        SheetPortal,
        SheetOverlay,
        SheetHeader,
        SheetFooter,
        SheetTitle,
        SheetDescription,
      ],
    ],
    [
      "Drawer",
      Drawer,
      [
        DrawerTrigger,
        DrawerClose,
        DrawerPortal,
        DrawerOverlay,
        DrawerHeader,
        DrawerFooter,
        DrawerTitle,
        DrawerDescription,
      ],
    ],
    [
      "AlertDialog",
      AlertDialog,
      [
        AlertDialogTrigger,
        AlertDialogPortal,
        AlertDialogOverlay,
        AlertDialogHeader,
        AlertDialogFooter,
        AlertDialogTitle,
        AlertDialogDescription,
      ],
    ],
  ] as const)("names every %s part after the dialog", (name, root, parts) => {
    expect((root as { displayName?: string }).displayName).toBe(name);
    parts.forEach((part) => {
      expect((part as { displayName?: string }).displayName).toMatch(
        new RegExp(`^${name}[A-Z]`),
      );
    });
  });

  it("gives the veil of each dialog its own look", () => {
    render(
      <Sheet defaultOpen>
        <SheetOverlay data-testid="plain" />
        <SheetOverlay data-testid="glass" material="glass" />
      </Sheet>,
    );

    expect(screen.getByTestId("plain")).toHaveClass("bg-black/80");
    expect(screen.getByTestId("plain")).not.toHaveAttribute("data-material");
    expect(screen.getByTestId("glass")).toHaveClass("vllnt-glass-scrim");
    expect(screen.getByTestId("glass")).toHaveAttribute(
      "data-material",
      "glass",
    );
  });

  it("marks the drawer's veil the way vaul did", () => {
    render(
      <Drawer defaultOpen>
        <DrawerOverlay data-testid="veil" />
      </Drawer>,
    );

    expect(screen.getByTestId("veil")).toHaveAttribute("data-vaul-overlay");
    fireEvent.keyDown(document.body, { key: "Escape" });
  });
});
