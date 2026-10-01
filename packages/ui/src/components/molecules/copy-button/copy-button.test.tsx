import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);

describe("CopyButton", () => {
  const writeText = vi.fn<(value: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
      writable: true,
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
    vi.useRealTimers();
  });

  it("renders text in the button variant", () => {
    render(<CopyButton label="Copy key" value="abc" variant="button" />);
    expect(screen.getByRole("button", { name: "Copy key" })).toHaveTextContent(
      "Copy key",
    );
  });

  it.each(["icon", "inline", "button"] as const)(
    "supports the %s variant",
    (variant) => {
      render(<CopyButton value="abc" variant={variant} />);
      expect(screen.getByRole("button", { name: "Copy" })).toBeVisible();
    },
  );

  it("exposes a status live region and writes the value to the clipboard on click", async () => {
    render(<CopyButton value="EXAMPLE_API_KEY" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("EXAMPLE_API_KEY");
    });
  });

  it("flips the accessible label to the copied state after a click", async () => {
    render(<CopyButton copiedLabel="Done!" value="x" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Done!" });
  });

  it("resets the copied state after the timeout elapses", async () => {
    render(<CopyButton timeout={500} value="x" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Copied!" });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });
  });

  it("keeps the copied state for 2000 ms when no timeout is given", async () => {
    render(<CopyButton value="x" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await screen.findByRole("button", { name: "Copied!" });
    act(() => {
      vi.advanceTimersByTime(1900);
    });
    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });
  });

  it("respects preventDefault from a caller's onClick", async () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });
    render(<CopyButton onClick={onClick} value="x" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("honors a custom aria-label", () => {
    render(<CopyButton aria-label="Copy API key" value="x" />);
    expect(
      screen.getByRole("button", { name: "Copy API key" }),
    ).toBeInTheDocument();
  });
});
