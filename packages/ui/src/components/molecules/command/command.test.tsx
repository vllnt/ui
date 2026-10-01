import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

function PaletteHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        type="button"
      >
        Open palette
      </button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command" />
        <CommandList>
          <CommandItem>Profile</CommandItem>
        </CommandList>
      </CommandDialog>
    </>
  );
}

describe("Command", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <Command className="custom-class" ref={ref}>
        Test
      </Command>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("dims only items cmdk marks as disabled (data-disabled=true)", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Enabled</CommandItem>
          <CommandItem disabled>Disabled</CommandItem>
        </CommandList>
      </Command>,
    );
    const enabled = screen.getByRole("option", { name: "Enabled" });
    const disabled = screen.getByRole("option", { name: "Disabled" });

    expect(enabled).toHaveAttribute("data-disabled", "false");
    expect(disabled).toHaveAttribute("data-disabled", "true");
    for (const item of [enabled, disabled]) {
      expect(item.className).not.toMatch(/data-\[disabled\]:/);
      expect(item.className).toContain("data-[disabled=true]:opacity-50");
    }
  });
});

describe("CommandDialog", () => {
  it("returns focus to the element that opened it when closed with Escape", async () => {
    render(<PaletteHarness />);
    const opener = screen.getByRole("button", { name: "Open palette" });

    opener.focus();
    fireEvent.click(opener);
    const input = screen.getByPlaceholderText("Type a command");
    expect(input).toHaveFocus();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});
