import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("renders the trigger but keeps the content closed by default", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("renders the content with merged className when defaultOpen is true", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="extra">Visible body</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Visible body")).toHaveClass("extra");
  });
});

const pressOutside = () => {
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
};

describe("Popover dismissal handlers", () => {
  const renderOpen = (
    handlers: React.ComponentProps<typeof PopoverContent>,
  ) => {
    const onOpenChange = vi.fn();
    render(
      <Popover defaultOpen onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent aria-label="Panel" {...handlers}>
          Body
        </PopoverContent>
      </Popover>,
    );
    return onOpenChange;
  };

  it("keeps the popover open when onEscapeKeyDown prevents the default", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const onOpenChange = renderOpen({ onEscapeKeyDown });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("closes on Escape when onEscapeKeyDown leaves the default alone", async () => {
    const onEscapeKeyDown = vi.fn();
    const onOpenChange = renderOpen({ onEscapeKeyDown });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    await waitFor(() => {
      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });
  });

  it.each(["onPointerDownOutside", "onInteractOutside"] as const)(
    "keeps the popover open when %s prevents the default",
    (name) => {
      const handler = vi.fn((event: Event) => {
        event.preventDefault();
      });
      const onOpenChange = renderOpen({ [name]: handler });
      pressOutside();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByText("Body")).toBeInTheDocument();
    },
  );

  it("keeps the content mounted while closed with forceMount", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent forceMount>Kept body</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Kept body")).toBeInTheDocument();
  });
});
