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

  it("renders Shortcut, Label, and Separator parts on their own", () => {
    render(
      <>
        <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
        <ContextMenuLabel>Section heading</ContextMenuLabel>
        <ContextMenuSeparator />
      </>,
    );
    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
    expect(screen.getByText("Section heading")).toBeInTheDocument();
  });
});
