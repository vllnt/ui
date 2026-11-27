import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CompletionDialog } from "./completion-dialog";

const press = (element: Element) => {
  fireEvent.pointerDown(element);
  fireEvent.pointerUp(element);
  fireEvent.click(element);
};

const getBackdrop = () => {
  const backdrop = document.querySelector(".vllnt-glass-scrim");
  if (!backdrop) throw new Error("no backdrop rendered");
  return backdrop;
};

const makeHandlers = () => ({
  onCancel: vi.fn(),
  onClose: vi.fn(),
  onConfirm: vi.fn(),
});

const renderOpen = () => {
  const handlers = makeHandlers();
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
    expect(onClose).toHaveBeenCalledWith();
  });
});

describe("CompletionDialog dialog semantics (WAI-ARIA APG modal dialog)", () => {
  it("is a named modal dialog that focuses the confirm button and traps Tab", () => {
    renderOpen();
    const dialog = screen.getByRole("dialog", { name: "Done?" });
    const confirm = screen.getByRole("button", { name: /Done/ });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(confirm).toHaveFocus();
    fireEvent.keyDown(confirm, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("wraps Shift+Tab from the first control to the last", () => {
    renderOpen();
    const close = screen.getByRole("button", { name: "Close" });
    close.focus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: /Done/ })).toHaveFocus();
  });

  it("lets Enter activate the focused button instead of always confirming", () => {
    const { onConfirm } = renderOpen();
    fireEvent.keyDown(screen.getByRole("button", { name: /Skip/ }), {
      key: "Enter",
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("scopes single-key shortcuts to the dialog and lets hosts turn them off", () => {
    const handlers = makeHandlers();
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

  it("lets a handler inside the dialog claim a shortcut key", () => {
    const handlers = makeHandlers();
    render(
      <CompletionDialog
        {...handlers}
        description={
          <input
            aria-label="Name"
            onKeyDown={(event) => {
              event.preventDefault();
            }}
          />
        }
        isOpen
        title="Done?"
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("Name"), { key: "d" });
    expect(handlers.onConfirm).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("button", { name: /Skip/ }), {
      key: "d",
    });
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("ignores shortcut letters typed into a field inside the dialog", () => {
    const handlers = makeHandlers();
    render(
      <CompletionDialog
        {...handlers}
        description={
          <>
            <input aria-label="Name" />
            <textarea aria-label="Notes" />
            <select aria-label="Plan">
              <option>Free</option>
            </select>
            <div aria-label="Rich" contentEditable role="textbox" />
            <div aria-label="Plain" contentEditable="false" role="group" />
            <input aria-label="Agree" type="checkbox" />
          </>
        }
        isOpen
        title="Done?"
      />,
    );
    ["Name", "Notes", "Plan", "Rich"].forEach((label) => {
      fireEvent.keyDown(screen.getByLabelText(label), { key: "d" });
      fireEvent.keyDown(screen.getByLabelText(label), { key: "S" });
    });
    expect(handlers.onConfirm).not.toHaveBeenCalled();
    expect(handlers.onCancel).not.toHaveBeenCalled();
    // A control that takes no text, or a held modifier, is not a text field.
    fireEvent.keyDown(screen.getByLabelText("Agree"), { key: "d" });
    fireEvent.keyDown(screen.getByLabelText("Plain"), { key: "s" });
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
    expect(handlers.onCancel).toHaveBeenCalledTimes(1);
    ["altKey", "ctrlKey", "metaKey"].forEach((modifier) => {
      fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "d",
        [modifier]: true,
      });
    });
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("returns focus to the element that was focused before it opened", async () => {
    const handlers = makeHandlers();
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
    expect(opener).not.toHaveFocus();
    rerender(view(false));
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it("labels the dialog by its title and describes it only when a description is given", () => {
    const handlers = makeHandlers();
    const { rerender } = render(
      <CompletionDialog {...handlers} isOpen title="Done?" />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Done?").id,
    );
    expect(dialog).not.toHaveAttribute("aria-describedby");
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
});

describe("CompletionDialog modal prop", () => {
  it("locks scroll by default and releases it on close", () => {
    const handlers = makeHandlers();
    const view = (isOpen: boolean) => (
      <CompletionDialog {...handlers} isOpen={isOpen} title="Done?" />
    );
    const { rerender } = render(view(true));
    expect(document.body.style.overflow).toBe("hidden");
    rerender(view(false));
    expect(document.body.style.overflow).toBe("");
  });

  it("makes the body the containing block while open, as Radix's scroll lock did", () => {
    const handlers = makeHandlers();
    const view = (isOpen: boolean) => (
      <CompletionDialog {...handlers} isOpen={isOpen} title="Done?" />
    );
    const { rerender } = render(view(true));
    expect(document.body.style.position).toBe("relative");
    rerender(view(false));
    expect(document.body.style.position).toBe("");
  });

  it("gives a host's own body position back on close", () => {
    document.body.style.position = "sticky";
    const handlers = makeHandlers();
    const { unmount } = render(
      <CompletionDialog {...handlers} isOpen title="Done?" />,
    );
    expect(document.body.style.position).toBe("relative");
    unmount();
    expect(document.body.style.position).toBe("sticky");
    document.body.style.position = "";
  });

  it("leaves scroll and the page alone when modal is false", () => {
    render(
      <>
        <button type="button">Page control</button>
        <CompletionDialog
          {...makeHandlers()}
          isOpen
          modal={false}
          title="Done?"
        />
      </>,
    );
    const dialog = screen.getByRole("dialog", { name: "Done?" });
    expect(dialog).not.toHaveAttribute("aria-modal");
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(screen.getByText("Page control")).not.toHaveAttribute("inert");
  });

  it("does not trap Tab when modal is false", () => {
    render(
      <CompletionDialog
        {...makeHandlers()}
        isOpen
        modal={false}
        title="Done?"
      />,
    );
    const confirm = screen.getByRole("button", { name: /Done/ });
    expect(confirm).toHaveFocus();
    expect(fireEvent.keyDown(confirm, { key: "Tab" })).toBe(true);
    expect(confirm).toHaveFocus();
  });

  it("gives the scrim a data-state only when modal", () => {
    const handlers = makeHandlers();
    const { rerender } = render(
      <CompletionDialog {...handlers} isOpen title="Done?" />,
    );
    expect(getBackdrop()).toHaveAttribute("data-state", "open");
    expect(getBackdrop()).not.toHaveAttribute("aria-hidden");
    rerender(
      <CompletionDialog {...handlers} isOpen modal={false} title="Done?" />,
    );
    expect(getBackdrop()).toHaveAttribute("aria-hidden", "true");
    expect(getBackdrop()).not.toHaveAttribute("data-state");
  });
});

describe("CompletionDialog inert page", () => {
  const view = (isOpen: boolean, modal = true) => (
    <div data-testid="app">
      <button type="button">Before</button>
      <section data-testid="stage">
        <p>Stage text</p>
        <CompletionDialog
          {...makeHandlers()}
          isOpen={isOpen}
          modal={modal}
          title="Done?"
        />
      </section>
      <div aria-live="polite" data-testid="live" />
      <button inert type="button">
        Already inert
      </button>
    </div>
  );

  it("makes every sibling of the dialog's ancestors inert, up to the body, and restores them", () => {
    const outside = document.createElement("aside");
    document.body.append(outside);
    const { container, rerender } = render(view(true));
    const dialog = screen.getByRole("dialog");

    [
      screen.getByText("Before"),
      screen.getByText("Stage text"),
      outside,
    ].forEach((element) => {
      expect(element).toHaveAttribute("inert");
    });
    expect(dialog.closest("[inert]")).toBeNull();
    expect(getBackdrop().closest("[inert]")).toBeNull();
    expect(container.closest("[inert]")).toBeNull();
    expect(screen.getByTestId("app")).not.toHaveAttribute("inert");
    expect(screen.getByTestId("stage")).not.toHaveAttribute("inert");

    rerender(view(false));
    [
      screen.getByText("Before"),
      screen.getByText("Stage text"),
      outside,
    ].forEach((element) => {
      expect(element).not.toHaveAttribute("inert");
    });
    outside.remove();
  });

  it("keeps live regions reachable and leaves already-inert elements inert", () => {
    const { rerender } = render(view(true));
    expect(screen.getByTestId("live")).not.toHaveAttribute("inert");
    rerender(view(false));
    expect(screen.getByText("Already inert")).toHaveAttribute("inert");
  });

  it("does not make anything inert when modal is false", () => {
    render(view(true, false));
    expect(screen.getByText("Before")).not.toHaveAttribute("inert");
    expect(screen.getByText("Stage text")).not.toHaveAttribute("inert");
  });
});

describe("CompletionDialog in place", () => {
  it("renders inside its container and covers it, not the viewport", () => {
    const { container } = render(
      <div className="relative" data-testid="host">
        <CompletionDialog {...makeHandlers()} isOpen title="Done?" />
      </div>,
    );
    const dialog = screen.getByRole("dialog");
    const layer = dialog.closest("[data-material]");
    expect(screen.getByTestId("host")).toContainElement(dialog);
    expect(container).toContainElement(dialog);
    expect(layer).toHaveClass("absolute", "inset-0", "z-[100]");
    expect(layer).toHaveAttribute("data-material", "glass");
    expect(dialog.closest("[popover]")).toBeNull();
    expect(getBackdrop()).toHaveClass("absolute", "inset-0");
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
    expect(getBackdrop()).toHaveAttribute("data-state", "open");
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

  it("ignores Escape while closed", () => {
    const handlers = makeHandlers();
    render(<CompletionDialog {...handlers} isOpen={false} title="Done?" />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handlers.onClose).not.toHaveBeenCalled();
  });

  it("invokes onClose when the backdrop is pressed", () => {
    const { onClose } = renderOpen();
    press(getBackdrop());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the dialog open for presses inside it", () => {
    const { onClose } = renderOpen();
    press(screen.getByRole("dialog"));
    press(screen.getByText("Done?"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the dialog open when a press starts inside and is released on the backdrop", () => {
    const { onClose } = renderOpen();
    fireEvent.pointerDown(screen.getByText("Done?"));
    fireEvent.pointerUp(getBackdrop());
    fireEvent.click(getBackdrop());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("invokes onClose from Escape and an outside press when modal is false", () => {
    const handlers = makeHandlers();
    render(
      <>
        <button type="button">Page control</button>
        <CompletionDialog {...handlers} isOpen modal={false} title="Done?" />
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
    press(getBackdrop());
    expect(handlers.onClose).toHaveBeenCalledTimes(2);
    press(screen.getByText("Page control"));
    expect(handlers.onClose).toHaveBeenCalledTimes(3);
  });

  it("invokes onClose when focus leaves a non-modal dialog, as Radix did", () => {
    const handlers = makeHandlers();
    render(
      <>
        <button type="button">Page control</button>
        <CompletionDialog {...handlers} isOpen modal={false} title="Done?" />
      </>,
    );
    screen.getByRole("button", { name: "Close" }).focus();
    expect(handlers.onClose).not.toHaveBeenCalled();
    screen.getByText("Page control").focus();
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

describe("CompletionDialog focus when modal is false", () => {
  const view = (isOpen: boolean) => (
    <>
      <button type="button">Finish lesson</button>
      <button type="button">Other control</button>
      <CompletionDialog
        {...makeHandlers()}
        isOpen={isOpen}
        modal={false}
        title="Done?"
      />
    </>
  );

  it("moves focus to the confirm button and returns it to the opener", () => {
    const { rerender } = render(view(false));
    const opener = screen.getByRole("button", { name: "Finish lesson" });
    opener.focus();
    rerender(view(true));
    expect(screen.getByRole("button", { name: /Done/ })).toHaveFocus();
    rerender(view(false));
    expect(opener).toHaveFocus();
  });

  it("leaves focus where the user moved it", () => {
    const { rerender } = render(view(false));
    screen.getByRole("button", { name: "Finish lesson" }).focus();
    rerender(view(true));
    const other = screen.getByRole("button", { name: "Other control" });
    other.focus();
    rerender(view(false));
    expect(other).toHaveFocus();
  });
});
