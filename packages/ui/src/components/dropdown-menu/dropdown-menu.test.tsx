import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("renders the trigger but keeps content closed by default", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.queryByText("Item")).not.toBeInTheDocument();
  });

  it("renders the content when defaultOpen is true", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();
  });
});

describe("DropdownMenuShortcut", () => {
  it("renders the shortcut text", () => {
    render(<DropdownMenuShortcut>Cmd+K</DropdownMenuShortcut>);

    expect(screen.getByText("Cmd+K")).toBeInTheDocument();
  });
});
