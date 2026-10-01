import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CompletionDialog } from "./completion-dialog";

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
  it("is a named modal dialog that focuses the confirm button and traps Tab", () => {
    renderOpen();
    const dialog = screen.getByRole("dialog", { name: "Done?" });
    const confirm = screen.getByRole("button", { name: /Done/ });
    expect(confirm).toHaveFocus();
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
    expect(opener).not.toHaveFocus();
    rerender(view(false));
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});

describe("CompletionDialog modal prop", () => {
  it("locks the page by default and leaves it interactive when modal is false", () => {
    const handlers = {
      onCancel: vi.fn(),
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    const { rerender } = render(
      <CompletionDialog {...handlers} isOpen title="Done?" />,
    );
    expect(document.body.style.pointerEvents).toBe("none");
    rerender(<CompletionDialog {...handlers} isOpen={false} title="Done?" />);
    rerender(
      <CompletionDialog {...handlers} isOpen modal={false} title="Done?" />,
    );
    expect(screen.getByRole("dialog", { name: "Done?" })).toBeInTheDocument();
    expect(document.body.style.pointerEvents).not.toBe("none");
  });
});
