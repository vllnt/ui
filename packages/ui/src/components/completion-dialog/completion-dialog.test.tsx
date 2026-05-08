import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CompletionDialog } from "./completion-dialog";

const baseProps = {
  onCancel: vi.fn(),
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: "Done?",
};

describe("CompletionDialog", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <CompletionDialog {...baseProps} isOpen={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the title and default labels when open", () => {
    render(<CompletionDialog {...baseProps} isOpen />);

    expect(screen.getByText("Done?")).toBeInTheDocument();
    expect(screen.getByText("Skip")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("uses override labels when provided", () => {
    render(
      <CompletionDialog
        {...baseProps}
        cancelLabel="Later"
        confirmLabel="Mark complete"
        isOpen
      />,
    );

    expect(screen.getByText("Later")).toBeInTheDocument();
    expect(screen.getByText("Mark complete")).toBeInTheDocument();
  });

  it("invokes onConfirm when the confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<CompletionDialog {...baseProps} isOpen onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("Done"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("invokes onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<CompletionDialog {...baseProps} isOpen onCancel={onCancel} />);

    fireEvent.click(screen.getByText("Skip"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<CompletionDialog {...baseProps} isOpen onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when the close icon button is clicked", () => {
    const onClose = vi.fn();
    render(<CompletionDialog {...baseProps} isOpen onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
