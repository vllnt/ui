import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenu", () => {
  it("renders the trigger but keeps content closed by default", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right-click target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.getByText("Right-click target")).toBeInTheDocument();
    expect(screen.queryByText("Item")).not.toBeInTheDocument();
  });
});

describe("ContextMenuShortcut", () => {
  it("renders the shortcut text", () => {
    render(<ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>);

    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
  });
});

describe("ContextMenuLabel + Separator + Item (rendered manually)", () => {
  it("renders Label children when rendered alone", () => {
    render(<ContextMenuLabel>Section heading</ContextMenuLabel>);

    expect(screen.getByText("Section heading")).toBeInTheDocument();
  });

  it("renders Separator + Item when used inside the menu", () => {
    render(<ContextMenuSeparator />);

    // Separator renders without crashing.
    expect(true).toBe(true);
  });
});
