import * as React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const pressOutside = () => {
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
};

const renderAlert = (
  props: React.ComponentProps<typeof AlertDialog> = {},
  content: React.ComponentProps<typeof AlertDialogContent> = {},
) =>
  render(
    <AlertDialog {...props}>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent {...content}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This is permanent.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );

describe("AlertDialog", () => {
  it("renders the trigger but keeps content closed by default", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          Body
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("renders the content when defaultOpen and invokes onOpenChange on cancel", () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog defaultOpen onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This is permanent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("AlertDialog Radix-compatible DOM", () => {
  it("is an alertdialog named by its title with data-state open", () => {
    renderAlert({ defaultOpen: true });
    const dialog = screen.getByRole("alertdialog", { name: "Are you sure?" });
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveAccessibleDescription("This is permanent.");
    expect(
      document.querySelector('[role="alertdialog"][data-state="open"]'),
    ).toBe(dialog);
  });

  it("emits data-state on the trigger and the scrim", () => {
    renderAlert();
    const trigger = screen.getByRole("button", { name: "Delete" });
    expect(trigger).toHaveAttribute("data-state", "closed");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(document.body.querySelector(".bg-black\\/80")).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("styles Cancel as the outline button and Action as the default button", () => {
    renderAlert({ defaultOpen: true });
    expect(screen.getByText("Cancel")).toHaveClass("border", "sm:mt-0");
    expect(screen.getByText("Confirm")).toHaveClass("bg-primary");
  });

  it("renders the trigger as the child element with asChild", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <a href="#delete">Delete link</a>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const trigger = screen.getByText("Delete link");
    expect(trigger.tagName).toBe("A");
    expect(trigger).toHaveAttribute("data-state", "closed");
  });
});

describe("AlertDialog behavior", () => {
  it("starts focus on Cancel", async () => {
    renderAlert();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    });
  });

  it("focuses Cancel even when Action comes first", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogAction>Confirm</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    });
  });

  it("focuses Cancel when Action comes first, opened as a browser would", async () => {
    // Two details hide the bug from the test above: jsdom has no layout, so
    // ui-sdk's first-tabbable fallback finds nothing, and `fireEvent` wraps
    // the click in `act`, which flushes Cancel's registration before focus.
    // Click outside `act`, on a laid-out page, to get the browser's order.
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogAction>Confirm</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      );
      screen.getByRole("button", { name: "Delete" }).click();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
      });
    } finally {
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    }
  });

  it("closes from Action and reports the click", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog defaultOpen onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogAction onClick={onClick}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Confirm"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("closes on Escape", () => {
    const onOpenChange = vi.fn();
    renderAlert({ defaultOpen: true, onOpenChange });
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the dialog open when onEscapeKeyDown prevents the default", () => {
    const onOpenChange = vi.fn();
    renderAlert(
      { defaultOpen: true, onOpenChange },
      {
        onEscapeKeyDown: (event) => {
          event.preventDefault();
        },
      },
    );
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("ignores a press outside the dialog", () => {
    const onOpenChange = vi.fn();
    renderAlert({ defaultOpen: true, onOpenChange });
    pressOutside();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("follows the open prop", async () => {
    const view = (open: boolean) => (
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
    const { rerender } = render(view(true));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    rerender(view(false));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("leaves focus where onCloseAutoFocus put it after preventDefault", async () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              screen.getByLabelText("Elsewhere").focus();
            }}
          >
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Delete" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByText("Cancel"));
    await waitFor(() => {
      expect(screen.getByLabelText("Elsewhere")).toHaveFocus();
    });
  });

  it("returns focus to the trigger by default", async () => {
    renderAlert();
    const trigger = screen.getByRole("button", { name: "Delete" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByText("Cancel"));
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("keeps focus where onOpenAutoFocus left it after preventDefault", async () => {
    const onOpenAutoFocus = vi.fn((event: Event) => {
      event.preventDefault();
    });
    renderAlert({}, { onOpenAutoFocus });
    const trigger = screen.getByRole("button", { name: "Delete" });
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole("button", { name: "Cancel" })).not.toHaveFocus();
  });
});
