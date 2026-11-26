import * as React from "react";

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  type SheetLabels,
  SheetOverlay,
  SheetPortal,
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

afterEach(() => {
  vi.restoreAllMocks();
});

const pressOutside = () => {
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
};

describe("Sheet Radix-compatible DOM", () => {
  it("is a dialog named by its title and described by its description", () => {
    renderOpenSheet();
    const dialog = screen.getByRole("dialog", { name: "Title" });

    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveAccessibleDescription("Description");
    expect(document.querySelector('[role="dialog"][data-state="open"]')).toBe(
      dialog,
    );
  });

  it("emits data-state on the trigger and the scrim", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });

    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(document.body.querySelector(".bg-black\\/80")).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("names the dialog from aria-label when the caller passes one", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent aria-label="Settings panel">
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(
      screen.getByRole("dialog", { name: "Settings panel" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["right", ["inset-y-0", "right-0", "border-l", "sm:max-w-sm"]],
    ["left", ["inset-y-0", "left-0", "border-r", "sm:max-w-sm"]],
    ["top", ["inset-x-0", "top-0", "border-b"]],
    ["bottom", ["inset-x-0", "bottom-0", "border-t"]],
  ] as const)("anchors the %s side", (side, classes) => {
    render(
      <Sheet defaultOpen>
        <SheetContent side={side}>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("dialog")).toHaveClass(
      "fixed",
      "vllnt-glass-floating",
      ...classes,
    );
  });

  it("slides in from the right by default", () => {
    renderOpenSheet();

    expect(screen.getByRole("dialog")).toHaveClass(
      "data-[state=open]:slide-in-from-right",
    );
  });

  it("puts the close button after the content, so the content takes the initial focus", () => {
    renderOpenSheet();
    const dialog = screen.getByRole("dialog");

    expect(dialog.lastElementChild).toBe(
      screen.getByRole("button", { name: "Close" }),
    );
  });

  it("keeps the glass material and accepts a solid one", () => {
    const { rerender } = render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-material",
      "glass",
    );
    rerender(
      <Sheet defaultOpen>
        <SheetContent material="solid">
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-material",
      "solid",
    );
  });

  it("forwards the ref to the panel", () => {
    const reference = React.createRef<HTMLDivElement>();
    render(
      <Sheet defaultOpen>
        <SheetContent ref={reference}>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(reference.current).toBe(screen.getByRole("dialog"));
  });

  it("keeps the content mounted while closed with forceMount", () => {
    render(
      <Sheet>
        <SheetContent forceMount>
          <SheetTitle>Title</SheetTitle>
          Body
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders the children of SheetPortal as they are", () => {
    render(
      <Sheet defaultOpen>
        <SheetPortal>
          <SheetOverlay />
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
          </SheetContent>
        </SheetPortal>
      </Sheet>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Sheet parts with asChild", () => {
  it("renders the trigger, close and title as their child element", async () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <a href="#open">Open link</a>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle asChild>
            <h2>Heading</h2>
          </SheetTitle>
          <SheetClose asChild>
            <a href="#done">Done link</a>
          </SheetClose>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByText("Open link");

    expect(trigger.tagName).toBe("A");
    expect(trigger).toHaveAttribute("data-state", "closed");
    fireEvent.click(trigger);
    expect(screen.getByText("Heading").tagName).toBe("H2");
    expect(screen.getByRole("dialog", { name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("Done link").tagName).toBe("A");
    fireEvent.click(screen.getByText("Done link"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("Sheet dismissal", () => {
  const renderOpen = (handlers: React.ComponentProps<typeof SheetContent>) => {
    const onOpenChange = vi.fn();
    render(
      <Sheet defaultOpen onOpenChange={onOpenChange}>
        <SheetContent {...handlers}>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    return onOpenChange;
  };

  it("closes on Escape", async () => {
    const onOpenChange = renderOpen({});
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes on a press outside", async () => {
    const onOpenChange = renderOpen({});
    pressOutside();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("keeps the sheet open when onEscapeKeyDown prevents the default", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onEscapeKeyDown });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps the sheet open when onPointerDownOutside prevents the default", () => {
    const onPointerDownOutside = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onPointerDownOutside });
    pressOutside();

    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps the sheet open when onInteractOutside prevents the default", () => {
    const onInteractOutside = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onInteractOutside });
    pressOutside();

    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("follows the open prop and keeps a controlled sheet open after a prevented Escape", async () => {
    const onOpenChange = vi.fn();
    const view = (open: boolean) => (
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
        >
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    const { rerender } = render(view(true));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(view(false));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("Sheet focus handlers", () => {
  it("moves focus into the panel and returns it to the trigger", async () => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <input aria-label="Name" />
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("focuses the first control of the content, not Close, when it opens", async () => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <input aria-label="Name" />
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toHaveFocus();
    });
    expect(screen.getByRole("button", { name: "Close" })).not.toHaveFocus();
  });

  it("leaves focus where onCloseAutoFocus put it after preventDefault", async () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              screen.getByLabelText("Elsewhere").focus();
            }}
          >
            <SheetTitle>Title</SheetTitle>
            <SheetClose>Done</SheetClose>
          </SheetContent>
        </Sheet>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByText("Done"));
    await waitFor(() => {
      expect(screen.getByLabelText("Elsewhere")).toHaveFocus();
    });
  });

  it("keeps focus out of the panel when onOpenAutoFocus prevents the default", async () => {
    const onOpenAutoFocus = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent onOpenAutoFocus={onOpenAutoFocus}>
          <SheetTitle>Title</SheetTitle>
          <input aria-label="Name" />
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByLabelText("Name")).not.toHaveFocus();
  });
});
