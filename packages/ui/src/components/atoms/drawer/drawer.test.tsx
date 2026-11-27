import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

afterEach(() => {
  vi.restoreAllMocks();
});

const pressOutside = () => {
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
};

const stubLayout = () =>
  vi
    .spyOn(Element.prototype, "getClientRects")
    .mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );

describe("Drawer", () => {
  it("renders the trigger but keeps content closed by default", () => {
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
          Body
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("renders the content when open is true", () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});

describe("Drawer focus (WAI-ARIA APG modal dialog)", () => {
  it("moves focus into the drawer when it opens", async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>Adjust your preferences.</DrawerDescription>
          <button type="button">Save</button>
        </DrawerContent>
      </Drawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open drawer" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("focuses the first control when the layout is known", async () => {
    stubLayout();
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Settings</DrawerTitle>
          <button type="button">Save</button>
        </DrawerContent>
      </Drawer>,
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    });
  });

  it("leaves focus on the trigger with autoFocus false", async () => {
    const keepFocus = { autoFocus: false };
    render(
      <Drawer {...keepFocus}>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Settings</DrawerTitle>
          <button type="button">Save</button>
        </DrawerContent>
      </Drawer>,
    );
    const trigger = screen.getByRole("button", { name: "Open drawer" });
    trigger.focus();
    fireEvent.click(trigger);
    await screen.findByRole("dialog");
    expect(screen.getByRole("button", { name: "Save" })).not.toHaveFocus();
    expect(document.activeElement).not.toBe(screen.getByRole("dialog"));
  });

  it("lets onOpenAutoFocus keep focus where its handler put it", async () => {
    stubLayout();
    const onOpenAutoFocus = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(
      <>
        <button type="button">Elsewhere</button>
        <Drawer open>
          <DrawerContent onOpenAutoFocus={onOpenAutoFocus}>
            <DrawerTitle>Settings</DrawerTitle>
            <button type="button">Save</button>
          </DrawerContent>
        </Drawer>
      </>,
    );
    await waitFor(() => {
      expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole("button", { name: "Save" })).not.toHaveFocus();
  });

  it("returns focus to the trigger when it closes", async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerClose>Done</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    const trigger = screen.getByRole("button", { name: "Open drawer" });
    trigger.focus();
    fireEvent.click(trigger);
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});

describe("Drawer Radix and vaul compatible DOM", () => {
  it("names and describes the dialog from the title and description", () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Move goal" });
    expect(dialog).toHaveAccessibleDescription("Set your daily activity goal.");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Move goal",
    );
  });

  it("emits data-state on the trigger, the panel and the veil", async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveAttribute("data-state", "closed");
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(document.querySelector("[data-vaul-overlay]")).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(document.querySelector("[data-vaul-drawer]")).toBe(dialog);
  });

  it("opens from the bottom and follows the direction prop", () => {
    const first = render(
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-vaul-drawer-direction",
      "bottom",
    );
    first.unmount();
    render(
      <Drawer direction="left" open>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-vaul-drawer-direction",
      "left",
    );
  });

  it("keeps the glass classes, the material and the handle bar", () => {
    render(
      <Drawer open>
        <DrawerContent className="custom" material="solid">
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("vllnt-glass-floating", "custom");
    expect(dialog).toHaveAttribute("data-material", "solid");
    expect(dialog.firstElementChild).toHaveClass("w-[100px]", "rounded-full");
  });

  it("forwards the ref and the aria-label of the panel", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Drawer open>
        <DrawerContent aria-label="Goal editor" ref={ref}>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Goal editor" });
    expect(ref.current).toBe(dialog);
  });

  it("renders DrawerPortal children in place and a custom overlay", () => {
    render(
      <Drawer open>
        <DrawerPortal>
          <p>Portaled</p>
        </DrawerPortal>
        <DrawerOverlay className="extra" data-testid="veil" />
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("Portaled")).toBeInTheDocument();
    expect(screen.getByTestId("veil")).toHaveClass("extra", "bg-black/80");
  });

  it("supports asChild on the trigger, the title, the description and close", async () => {
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <a href="#open">Open as link</a>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle asChild>
            <h3>Custom title</h3>
          </DrawerTitle>
          <DrawerDescription asChild>
            <span>Custom description</span>
          </DrawerDescription>
          <DrawerClose asChild>
            <a href="#close">Close link</a>
          </DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    fireEvent.click(screen.getByText("Open as link"));
    const dialog = await screen.findByRole("dialog", { name: "Custom title" });
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    expect(dialog).toHaveAccessibleDescription("Custom description");
    fireEvent.click(screen.getByText("Close link"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("accepts the props that only the previous library had", () => {
    render(
      <Drawer
        closeThreshold={0.4}
        fadeFromIndex={0}
        noBodyStyles
        onDrag={vi.fn()}
        open
        shouldScaleBackground={false}
      >
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument();
  });
});

describe("Drawer dismissal", () => {
  const renderOpen = (
    props: Partial<React.ComponentProps<typeof Drawer>> = {},
    content: Partial<React.ComponentProps<typeof DrawerContent>> = {},
  ) => {
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    render(
      <Drawer
        defaultOpen
        onClose={onClose}
        onOpenChange={onOpenChange}
        {...props}
      >
        <DrawerContent {...content}>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerClose>Done</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    return { onClose, onOpenChange };
  };

  it("closes on Escape and reports it once through both callbacks", async () => {
    const { onClose, onOpenChange } = renderOpen();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes from the close button and from a press on the page behind", () => {
    const first = renderOpen();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(first.onOpenChange).toHaveBeenCalledWith(false);
    const second = renderOpen();
    pressOutside();
    expect(second.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the drawer open when Escape is prevented", () => {
    const { onOpenChange } = renderOpen(
      {},
      {
        onEscapeKeyDown: (event) => {
          event.preventDefault();
        },
      },
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps the drawer open when a press outside is prevented", () => {
    const onPointerDownOutside = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const { onOpenChange } = renderOpen({}, { onPointerDownOutside });
    pressOutside();
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ignores Escape and outside presses when dismissible is false", () => {
    const { onOpenChange } = renderOpen({ dismissible: false });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    pressOutside();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("follows the open prop when controlled", async () => {
    const onOpenChange = vi.fn();
    const view = (open: boolean) => (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    const { rerender } = render(view(true));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(view(false));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("DrawerContent overlay", () => {
  it("draws the veil by default and none with overlay none", () => {
    const { unmount } = render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(document.body.querySelector("[data-vaul-overlay]")).not.toBeNull();
    unmount();

    render(
      <Drawer defaultOpen>
        <DrawerContent overlay="none">
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(document.body.querySelector("[data-vaul-overlay]")).toBeNull();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
