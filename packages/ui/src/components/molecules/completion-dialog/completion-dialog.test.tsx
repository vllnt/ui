import { fireEvent, render, screen } from "@testing-library/react";
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
