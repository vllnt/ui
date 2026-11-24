import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";

const rightClick = (element: HTMLElement) => {
  fireEvent.contextMenu(element, { button: 2, clientX: 40, clientY: 24 });
};

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

describe("ContextMenu opening", () => {
  it("renders the trigger as a span, like Radix, and opens on right-click", () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenuTrigger>Right-click target</ContextMenuTrigger>
        <ContextMenuContent className="extra">
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const trigger = screen.getByText("Right-click target");
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger).toHaveAttribute("data-state", "closed");

    rightClick(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange.mock.calls[0]).toHaveLength(1);
    expect(trigger).toHaveAttribute("data-state", "open");
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-state", "open");
    expect(menu).toHaveClass("extra");
    expect(menu).toHaveAttribute("data-side");
  });

  it("renders the child as the trigger with asChild", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <section aria-label="Canvas">Canvas</section>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const canvas = screen.getByLabelText("Canvas");
    expect(canvas.tagName).toBe("SECTION");
    rightClick(canvas);
    expect(canvas).toHaveAttribute("data-state", "open");
  });

  it("does not open from a disabled trigger", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger disabled>Right-click target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    rightClick(screen.getByText("Right-click target"));
    expect(screen.queryByText("Item")).not.toBeInTheDocument();
  });

  it("keeps the menu open when onEscapeKeyDown calls preventDefault, and closes on Escape otherwise", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const { rerender } = render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent onEscapeKeyDown={onEscapeKeyDown}>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Target")).toHaveAttribute("data-state", "open");

    rerender(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.getByText("Target")).toHaveAttribute("data-state", "closed");
  });

  it("forwards the content ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent ref={ref}>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(ref.current).toBe(screen.getByRole("menu"));
  });
});

describe("ContextMenu items", () => {
  it("stops at the last item, and wraps to the first only with loop, like Radix", () => {
    const { unmount } = render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuItem>Two</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "End" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Two" })).toHaveAttribute(
      "data-highlighted",
    );
    unmount();

    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent loop>
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuItem>Two</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const looping = screen.getByRole("menu");
    fireEvent.keyDown(looping, { key: "End" });
    fireEvent.keyDown(looping, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "One" })).toHaveAttribute(
      "data-highlighted",
    );
  });

  it("runs onSelect and closes the menu, unless onSelect calls preventDefault", () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Copy</ContextMenuItem>
          <ContextMenuItem
            onSelect={(event) => {
              event.preventDefault();
            }}
          >
            Stay
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Stay" }));
    expect(screen.getByText("Target")).toHaveAttribute("data-state", "open");

    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Target")).toHaveAttribute("data-state", "closed");
  });

  it("toggles a checkbox item with the Radix data-state values", () => {
    const onCheckedChange = vi.fn();
    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem
            closeOnSelect={false}
            onCheckedChange={onCheckedChange}
          >
            Grid
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const box = screen.getByRole("menuitemcheckbox", { name: /Grid/ });
    expect(box).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(box);

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(box).toHaveAttribute("data-state", "checked");
  });

  it("selects a radio item and reports its value as a string", () => {
    const onValueChange = vi.fn();
    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup onValueChange={onValueChange} value="a">
            <ContextMenuRadioItem value="a">Alpha</ContextMenuRadioItem>
            <ContextMenuRadioItem value="b">Beta</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(
      screen.getByRole("menuitemradio", { name: /Alpha/ }),
    ).toHaveAttribute("data-state", "checked");
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Beta/ }));
    expect(onValueChange.mock.calls[0]?.[0]).toBe("b");
  });

  it("opens a submenu from its trigger", () => {
    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Nested</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const subTrigger = screen.getByRole("menuitem", { name: /More/ });
    expect(subTrigger).toHaveAttribute("data-state", "closed");
    expect(subTrigger).toHaveClass("pl-8");

    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });

    expect(subTrigger).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Nested")).toBeInTheDocument();
  });
});
