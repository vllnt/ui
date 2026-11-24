import * as React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const veil = (): Element | null => document.body.querySelector(".inset-0");

const pressOutside = () => {
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
};

afterEach(() => {
  vi.restoreAllMocks();
});

const locked = () =>
  document.documentElement.style.overflow === "hidden" ||
  document.body.style.overflow === "hidden";

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

    it("draws no veil when overlay is none, and the dialog stays modal", async () => {
      const container = renderDialog("none");
      expect(veil()).not.toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await waitFor(() => {
        expect(container).toHaveProperty("inert", true);
      });
    });

    it("still closes on Escape when overlay is none", () => {
      const onOpenChange = vi.fn();
      renderDialog("none", onOpenChange);
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it.each<"none" | "scrim" | undefined>([undefined, "scrim", "none"])(
      "locks page scroll while the dialog is open with overlay %s",
      async (overlay) => {
        renderDialog(overlay);
        await waitFor(() => {
          expect(locked()).toBe(true);
        });
      },
    );

    it.each<"none" | "scrim">(["scrim", "none"])(
      "releases the scroll lock when the dialog closes with overlay %s",
      async (overlay) => {
        renderDialog(overlay);
        await waitFor(() => {
          expect(locked()).toBe(true);
        });
        fireEvent.click(screen.getByText("Close"));
        await waitFor(() => {
          expect(locked()).toBe(false);
        });
      },
    );
  });

  it("is glass by default: the scrim and the dense floating content", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveAttribute("data-material", "glass");
    expect(content).toHaveClass("vllnt-glass-floating", "vllnt-glass-dense");
    expect(document.body.querySelector(".vllnt-glass-scrim")).toHaveAttribute(
      "data-material",
      "glass",
    );
  });

  it("material=solid on the content makes the scrim solid too", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent material="solid">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-material",
      "solid",
    );
    expect(document.body.querySelector(".vllnt-glass-scrim")).toHaveAttribute(
      "data-material",
      "solid",
    );
  });
});

describe("Dialog Radix-compatible DOM", () => {
  it("emits data-state on the trigger, the content and the scrim", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");
    expect(document.body.querySelector(".vllnt-glass-scrim")).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("names the dialog by its title and describes it by its description", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>Anyone can view it</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Share link" });
    expect(dialog).toHaveAccessibleDescription("Anyone can view it");
  });

  it("lets an aria-label name the dialog, as Radix did", () => {
    render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-label="Settings">Body</DialogContent>
      </Dialog>,
    );
    expect(
      screen.getByRole("dialog", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("matches the console's open-dialog query", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(
      document.querySelector('[role="dialog"][data-state="open"]'),
    ).toBeInTheDocument();
  });

  it("forwards ref to the content element", () => {
    const reference = React.createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <DialogContent ref={reference}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(reference.current).toBe(screen.getByRole("dialog"));
  });

  it("keeps the content mounted while closed with forceMount", () => {
    render(
      <Dialog>
        <DialogContent forceMount>
          <DialogTitle>Title</DialogTitle>
          Body
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders the children of DialogPortal as they are", () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Dialog open state", () => {
  it("opens from the trigger and closes from DialogClose", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Done"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("follows the open prop and asks for changes through onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const view = (open: boolean) => (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const { rerender } = render(view(true));
    fireEvent.click(screen.getByText("Close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(view(false));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("renders the trigger and close as the child element with asChild", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <a href="#open">Open link</a>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <a href="#done">Done link</a>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByText("Open link");
    expect(trigger.tagName).toBe("A");
    expect(trigger).toHaveAttribute("data-state", "closed");
    fireEvent.click(trigger);
    expect(screen.getByText("Done link").tagName).toBe("A");
  });

  it("renders the title as the child element with asChild", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle asChild>
            <h3>Custom heading</h3>
          </DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Custom heading" }),
    ).toHaveClass("text-lg");
  });
});

describe("Dialog dismissal handlers", () => {
  const renderOpen = (handlers: React.ComponentProps<typeof DialogContent>) => {
    const onOpenChange = vi.fn();
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent {...handlers}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    return onOpenChange;
  };

  it("closes on a press outside", async () => {
    const onOpenChange = renderOpen({});
    pressOutside();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("keeps the dialog open when onEscapeKeyDown prevents the default", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onEscapeKeyDown });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape when onEscapeKeyDown leaves the default alone", () => {
    const onEscapeKeyDown = vi.fn();
    const onOpenChange = renderOpen({ onEscapeKeyDown });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the dialog open when onPointerDownOutside prevents the default", () => {
    const onPointerDownOutside = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onPointerDownOutside });
    pressOutside();
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps the dialog open when onInteractOutside prevents the default", () => {
    const onInteractOutside = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onInteractOutside });
    pressOutside();
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps a controlled dialog open when a handler prevents the default", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
        >
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Dialog focus handlers", () => {
  it("moves focus to the first control and returns it to the trigger", async () => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <input aria-label="Name" />
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    const input = await screen.findByLabelText("Name");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("leaves focus where onCloseAutoFocus put it after preventDefault", async () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              screen.getByLabelText("Elsewhere").focus();
            }}
          >
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </Dialog>
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

  it("keeps focus out of the content when onOpenAutoFocus prevents the default", async () => {
    const onOpenAutoFocus = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent onOpenAutoFocus={onOpenAutoFocus}>
          <DialogTitle>Title</DialogTitle>
          <input aria-label="Name" />
        </DialogContent>
      </Dialog>,
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
