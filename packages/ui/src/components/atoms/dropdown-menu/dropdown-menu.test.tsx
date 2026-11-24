import * as React from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const item = (name: string) => screen.getByRole("menuitem", { name });

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

  it('marks the content glass by default and solid with material="solid"', () => {
    const { rerender } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("menu")).toHaveAttribute("data-material", "glass");
    rerender(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent material="solid">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("menu")).toHaveAttribute("data-material", "solid");
  });

  it("DropdownMenuShortcut renders the shortcut text", () => {
    render(<DropdownMenuShortcut>Cmd+K</DropdownMenuShortcut>);
    expect(screen.getByText("Cmd+K")).toBeInTheDocument();
  });

  it("renders the label and the separator as plain elements, with or without a menu", () => {
    render(
      <>
        <DropdownMenuLabel inset>Alone</DropdownMenuLabel>
        <DropdownMenuSeparator data-testid="rule" />
      </>,
    );
    expect(screen.getByText("Alone")).toHaveClass("pl-8", "font-semibold");
    expect(screen.getByTestId("rule")).toHaveAttribute("role", "separator");
    expect(screen.getByTestId("rule")).toHaveClass("bg-border");
  });

  it("renders Portal children in place", () => {
    render(
      <DropdownMenuPortal>
        <span>Portaled</span>
      </DropdownMenuPortal>,
    );
    expect(screen.getByText("Portaled")).toBeInTheDocument();
  });
});

describe("DropdownMenu opening", () => {
  it("opens from the trigger with the Radix attributes, and reports it as a boolean", () => {
    const onOpenChange = vi.fn();
    render(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="extra">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("data-state", "closed");

    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange.mock.calls[0]).toHaveLength(1);
    expect(trigger).toHaveAttribute("data-state", "open");
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-state", "open");
    expect(menu).toHaveAttribute("data-orientation", "vertical");
    expect(menu).toHaveAttribute("data-side", "bottom");
    expect(menu).toHaveAttribute("data-align", "center");
    expect(menu).toHaveClass("extra");
  });

  it("follows a controlled open prop and asks to close on Escape", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DropdownMenu onOpenChange={onOpenChange} open>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Item")).toBeInTheDocument();

    rerender(
      <DropdownMenu onOpenChange={onOpenChange} open={false}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("keeps the menu open when onEscapeKeyDown calls preventDefault", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const onOpenChange = vi.fn();
    render(
      <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent onEscapeKeyDown={onEscapeKeyDown}>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "Escape",
    });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("keeps the content in the page while closed with forceMount", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent forceMount>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Item")).toBeInTheDocument();
    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("forwards the content ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent ref={ref}>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBe(screen.getByRole("menu"));
  });

  it("renders the child as the trigger with asChild", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <a href="#menu">Open</a>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const link = screen.getByRole("link", { name: "Open" });
    expect(link).toHaveAttribute("aria-haspopup", "menu");
    expect(link).toHaveAttribute("data-state", "closed");
  });

  it("returns focus to the trigger when it closes", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    item("Item").focus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("leaves focus where onCloseAutoFocus put it after preventDefault", async () => {
    const onCloseAutoFocus = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(
      <>
        <input aria-label="Elsewhere" />
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={onCloseAutoFocus}>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>,
    );
    const elsewhere = screen.getByLabelText("Elsewhere");
    item("Item").focus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    elsewhere.focus();
    await act(async () => {
      await Promise.resolve();
    });
    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
    expect(elsewhere).toHaveFocus();
  });
});

describe("DropdownMenu items", () => {
  it("runs onSelect and onClick, then closes the menu", () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick} onSelect={onSelect}>
            Copy
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(item("Copy"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("keeps the menu open when onSelect calls preventDefault", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
            }}
          >
            Stay
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(item("Stay"));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("marks a disabled item and does not run it", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Off
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(item("Off")).toHaveAttribute("data-disabled");
    fireEvent.click(item("Off"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders the child as the item with asChild and indents with inset", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild inset>
            <a href="#docs">Docs</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const link = screen.getByRole("menuitem", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "#docs");
    expect(link).toHaveClass("pl-8");
  });

  it("stops at the last item, and wraps to the first only with loop, like Radix", () => {
    const { unmount } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent loop>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "End" });
    expect(item("Two")).toHaveAttribute("data-highlighted");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(item("One")).toHaveAttribute("data-highlighted");
    unmount();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const stopping = screen.getByRole("menu");
    fireEvent.keyDown(stopping, { key: "End" });
    fireEvent.keyDown(stopping, { key: "ArrowDown" });
    expect(item("Two")).toHaveAttribute("data-highlighted");
  });

  it("groups items", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup data-testid="group">
            <DropdownMenuItem>One</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByTestId("group")).toHaveAttribute("role", "group");
  });
});

describe("DropdownMenu checkable items", () => {
  it("toggles a checkbox item with the Radix data-state values", () => {
    const onCheckedChange = vi.fn();
    const Example = () => {
      const [checked, setChecked] = React.useState(false);

      return (
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              closeOnSelect={false}
              onCheckedChange={(next) => {
                onCheckedChange(next);
                setChecked(next);
              }}
            >
              Bold
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };
    render(<Example />);
    const box = screen.getByRole("menuitemcheckbox", { name: /Bold/ });
    expect(box).toHaveAttribute("data-state", "unchecked");
    expect(box).toHaveAttribute("aria-checked", "false");

    fireEvent.click(box);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("data-state", "checked");
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("closes the menu after a checkbox item is chosen, like Radix", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem>Bold</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Bold/ }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("keeps the menu open for a checkbox item with closeOnSelect false", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem closeOnSelect={false}>
            Bold
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Bold/ }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("reports an indeterminate checkbox item as indeterminate", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked="indeterminate">
            Some
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Some/ }),
    ).toHaveAttribute("data-state", "indeterminate");
  });

  it("selects a radio item, reports its value as a string and closes the menu", () => {
    const onValueChange = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup onValueChange={onValueChange} value="a">
            <DropdownMenuRadioItem value="a">Alpha</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Beta</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const alpha = screen.getByRole("menuitemradio", {
      name: /Alpha/,
    });
    const beta = screen.getByRole("menuitemradio", {
      name: /Beta/,
    });
    expect(alpha).toHaveAttribute("data-state", "checked");
    expect(beta).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(beta);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe("b");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });
});

describe("DropdownMenu submenus", () => {
  it("opens a submenu from its trigger with the Radix data-state values", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="extra">
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const subTrigger = screen.getByRole("menuitem", {
      name: /More/,
    });
    expect(subTrigger).toHaveAttribute("data-state", "closed");
    expect(subTrigger).toHaveClass("pl-8");
    expect(screen.queryByText("Nested")).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });

    expect(subTrigger).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Nested")).toBeInTheDocument();
    const menus = screen.getAllByRole("menu");
    expect(menus[1]).toHaveClass("extra");
    expect(menus[1]).toHaveAttribute("data-state", "open");
  });
});

describe("DropdownMenu accessibility attributes", () => {
  it("exposes a mixed checkbox item as aria-checked=mixed, like Radix", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked="indeterminate">
            Mixed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked>On</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>
            Off
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const mixed = screen.getByRole("menuitemcheckbox", { name: /Mixed/ });
    expect(mixed).toHaveAttribute("aria-checked", "mixed");
    expect(mixed).toHaveAttribute("data-state", "indeterminate");
    expect(
      screen.getByRole("menuitemcheckbox", { name: /On/ }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Off/ }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("names the menu after its trigger, whether it opened by click or by prop", () => {
    const { unmount } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(trigger);
    expect(trigger.id).not.toBe("");
    expect(screen.getByRole("menu")).toHaveAttribute(
      "aria-labelledby",
      trigger.id,
    );
    unmount();

    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("menu")).toHaveAttribute(
      "aria-labelledby",
      screen.getByRole("button", { name: "Menu" }).id,
    );
  });

  it("names a submenu after its sub trigger", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub defaultOpen>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const subTrigger = screen.getByRole("menuitem", { name: /More/ });
    expect(screen.getAllByRole("menu")[1]).toHaveAttribute(
      "aria-labelledby",
      subTrigger.id,
    );
  });
});
