import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "./toast";

describe("Toast", () => {
  it("renders children", () => {
    render(
      <Toast>
        <span>body</span>
      </Toast>,
    );

    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("applies the destructive variant class", () => {
    const { container } = render(<Toast variant="destructive">x</Toast>);

    expect(container.firstChild).toHaveClass("destructive");
  });

  it("merges the className prop", () => {
    const { container } = render(<Toast className="extra">x</Toast>);

    expect(container.firstChild).toHaveClass("extra");
  });
});

describe("ToastTitle + ToastDescription", () => {
  it("renders title and description", () => {
    render(
      <Toast>
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>Run completed.</ToastDescription>
      </Toast>,
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Run completed.")).toBeInTheDocument();
  });
});

describe("ToastClose", () => {
  it("invokes onClick when clicked", () => {
    const handleClose = vi.fn();
    render(<ToastClose onClick={handleClose} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("emits the data-toast-close attribute for analytics", () => {
    render(<ToastClose />);

    expect(screen.getByRole("button")).toHaveAttribute("data-toast-close");
  });
});

describe("ToastAction", () => {
  it("renders children + invokes onClick", () => {
    const handleClick = vi.fn();
    render(
      <ToastAction altText="retry" onClick={handleClick}>
        Retry
      </ToastAction>,
    );

    fireEvent.click(screen.getByText("Retry"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
