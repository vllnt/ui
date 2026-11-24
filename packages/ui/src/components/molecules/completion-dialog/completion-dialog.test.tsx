import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CompletionDialog } from "./completion-dialog";

afterEach(() => {
  vi.restoreAllMocks();
});

const pressOutside = () => {
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
};

const renderOpen = () => {
  const handlers = { onCancel: vi.fn(), onClose: vi.fn(), onConfirm: vi.fn() };
  render(<CompletionDialog {...handlers} isOpen title="Done?" />);
  return handlers;
};

describe("CompletionDialog", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <CompletionDialog
        isOpen={false}
        onCancel={vi.fn()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Done?"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the title and default labels when open", () => {
    renderOpen();
    expect(screen.getByText("Done?")).toBeInTheDocument();
    expect(screen.getByText("Skip")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("uses override labels when provided", () => {
    render(
      <CompletionDialog
        cancelLabel="Later"
        confirmLabel="Mark complete"
        isOpen
        onCancel={vi.fn()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Done?"
      />,
    );
    expect(screen.getByText("Later")).toBeInTheDocument();
    expect(screen.getByText("Mark complete")).toBeInTheDocument();
  });

  it("invokes onConfirm and onCancel from their buttons", () => {
    const { onCancel, onConfirm } = renderOpen();
    fireEvent.click(screen.getByText("Done"));
    fireEvent.click(screen.getByText("Skip"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when Escape is pressed", () => {
    const { onClose } = renderOpen();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when the close icon button is clicked", () => {
    const { onClose } = renderOpen();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("CompletionDialog dialog semantics (WAI-ARIA APG modal dialog)", () => {
  it("is a named modal dialog that focuses the confirm button and traps Tab", async () => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
    renderOpen();
    const dialog = screen.getByRole("dialog", { name: "Done?" });
    const confirm = screen.getByRole("button", { name: /Done/ });
    await waitFor(() => {
      expect(confirm).toHaveFocus();
    });
    fireEvent.keyDown(confirm, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("lets Enter activate the focused button instead of always confirming", () => {
    const { onConfirm } = renderOpen();
    fireEvent.keyDown(screen.getByRole("button", { name: /Skip/ }), {
      key: "Enter",
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("scopes single-key shortcuts to the dialog and lets hosts turn them off", () => {
    const handlers = {
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    const { rerender } = render(
      <>
        <input aria-label="Notes" />
        <CompletionDialog {...handlers} isOpen title="Done?" />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText("Notes"), { key: "d" });
    expect(handlers.onConfirm).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "d" });
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
    rerender(
      <>
        <input aria-label="Notes" />
        <CompletionDialog
          {...handlers}
          cancelShortcut=""
          confirmShortcut=""
          isOpen
          title="Done?"
        />
      </>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "d" });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "s" });
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
    expect(handlers.onCancel).not.toHaveBeenCalled();
  });

  it("returns focus to the element that was focused before it opened", async () => {
    const handlers = {
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    const view = (isOpen: boolean) => (
      <>
        <button type="button">Finish lesson</button>
        <CompletionDialog {...handlers} isOpen={isOpen} title="Done?" />
      </>
    );
    const { rerender } = render(view(false));
    const opener = screen.getByRole("button", { name: "Finish lesson" });
    opener.focus();
    rerender(view(true));
    await waitFor(() => {
      expect(opener).not.toHaveFocus();
    });
    rerender(view(false));
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});

describe("CompletionDialog modal prop", () => {
  it("locks the page by default and leaves it interactive when modal is false", async () => {
    const handlers = {
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    const view = (props: { isOpen: boolean; modal?: boolean }) => (
      <>
        <button type="button">Page control</button>
        <CompletionDialog {...handlers} {...props} title="Done?" />
      </>
    );
    const { container, rerender } = render(view({ isOpen: true }));
    await waitFor(() => {
      expect(container).toHaveProperty("inert", true);
    });
    rerender(view({ isOpen: false }));
    await waitFor(() => {
      expect(container).toHaveProperty("inert", false);
    });
    rerender(view({ isOpen: true, modal: false }));
    expect(screen.getByRole("dialog", { name: "Done?" })).toBeInTheDocument();
    expect(container).toHaveProperty("inert", false);
  });
});

describe("CompletionDialog Radix-compatible DOM", () => {
  it("emits data-state open on the dialog and the scrim", () => {
    renderOpen();
    const dialog = screen.getByRole("dialog", { name: "Done?" });
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(document.querySelector('[role="dialog"][data-state="open"]')).toBe(
      dialog,
    );
    expect(document.querySelector(".vllnt-glass-scrim")).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("describes the dialog only when a description is given", () => {
    const handlers = {
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    const { rerender } = render(
      <CompletionDialog {...handlers} isOpen title="Done?" />,
    );
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
    rerender(
      <CompletionDialog
        {...handlers}
        description="Mark this lesson as complete."
        isOpen
        title="Done?"
      />,
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Mark this lesson as complete.",
    );
  });

  it("renders the title with the chosen heading tag", () => {
    render(
      <CompletionDialog
        as="h3"
        isOpen
        onCancel={vi.fn()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Done?"
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Done?" })).toBe(
      screen.getByRole("dialog").querySelector("h3"),
    );
  });

  it("passes the material to the container and shows a custom close icon", () => {
    render(
      <CompletionDialog
        closeIcon={<span data-testid="icon">x</span>}
        isOpen
        material="solid"
        onCancel={vi.fn()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Done?"
      />,
    );
    expect(document.querySelector('[data-material="solid"]')).not.toBeNull();
    expect(screen.getByLabelText("Close")).toContainElement(
      screen.getByTestId("icon"),
    );
  });
});

describe("CompletionDialog dismissal", () => {
  it("invokes onClose from Escape pressed inside the dialog", () => {
    const { onClose } = renderOpen();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when the page behind is pressed", () => {
    const { onClose } = renderOpen();
    pressOutside();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose from a press outside when modal is false", () => {
    const handlers = {
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    render(
      <CompletionDialog {...handlers} isOpen modal={false} title="Done?" />,
    );
    pressOutside();
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it("confirms and cancels from the single-key shortcuts", () => {
    const { onCancel, onConfirm } = renderOpen();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "D" });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "s" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
