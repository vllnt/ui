import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar";

type BarProps = Partial<React.ComponentProps<typeof Menubar>>;

const Bar = (props: BarProps) => (
  <Menubar aria-label="Editor" {...props}>
    <MenubarMenu value="file">
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          New tab <MenubarShortcut>⌘T</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled>Share</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu value="edit">
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Undo</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
);

describe("Menubar", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <Menubar className="custom-class" ref={ref} />,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveClass("h-10");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("keeps every menu closed by default", () => {
    render(<Bar />);
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "closed",
    );
    expect(screen.queryByText("New tab")).not.toBeInTheDocument();
  });
});

describe("Menubar menus", () => {
  it("opens a menu from its trigger with the Radix state attributes", () => {
    render(<Bar />);
    const trigger = screen.getByRole("menuitem", { name: "File" });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("data-state", "open");
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-state", "open");
    expect(menu).toHaveAttribute("data-side");
    expect(menu).toHaveAttribute("data-align");
    expect(menu).toHaveClass("min-w-[12rem]");
    expect(screen.getByText("⌘T")).toBeInTheDocument();
  });

  it("starts with the menu named by defaultValue open", () => {
    render(<Bar defaultValue="edit" />);
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("reports the open menu's value, and an empty string once it closes", () => {
    const onValueChange = vi.fn();
    render(<Bar onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("menuitem", { name: "File" }));
    expect(onValueChange).toHaveBeenLastCalledWith("file");

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("follows a controlled value", () => {
    const { rerender } = render(<Bar value="" />);
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "closed",
    );

    rerender(<Bar value="file" />);
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(screen.getByText("New tab")).toBeInTheDocument();
  });

  it("keeps a controlled menu open when onEscapeKeyDown calls preventDefault", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    render(
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent onEscapeKeyDown={onEscapeKeyDown}>
            <MenubarItem>New tab</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("moves between the triggers with the arrow keys", () => {
    render(<Bar />);
    const file = screen.getByRole("menuitem", { name: "File" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    file.focus();

    fireEvent.keyDown(file, { key: "ArrowRight" });

    expect(edit).toHaveFocus();
  });

  it("wraps around the ends, unless loop is false", () => {
    const { rerender } = render(<Bar />);
    const file = screen.getByRole("menuitem", { name: "File" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    edit.focus();
    fireEvent.keyDown(edit, { key: "ArrowRight" });
    expect(file).toHaveFocus();

    rerender(<Bar loop={false} />);
    edit.focus();
    fireEvent.keyDown(edit, { key: "ArrowRight" });
    expect(edit).toHaveFocus();
  });

  it("switches the open menu when another trigger is pressed", () => {
    render(<Bar defaultValue="file" />);

    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("renders the child as the trigger with asChild", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger asChild>
            <a href="#file">File</a>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New tab</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByRole("menuitem", { name: "File" }).tagName).toBe("A");
  });
});

describe("Menubar items", () => {
  it("stops at the last item of a menu, and wraps only with loop on the content", () => {
    const Menu = ({ loop }: { loop?: boolean }) => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent loop={loop}>
            <MenubarItem>One</MenubarItem>
            <MenubarItem>Two</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    const { unmount } = render(<Menu />);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "End" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Two" })).toHaveAttribute(
      "data-highlighted",
    );
    unmount();

    render(<Menu loop />);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "End" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "One" })).toHaveAttribute(
      "data-highlighted",
    );
  });

  it("runs onSelect and closes the menu, unless the item is disabled", () => {
    const onSelect = vi.fn();
    render(
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled onSelect={onSelect}>
              Share
            </MenubarItem>
            <MenubarItem onSelect={onSelect}>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const share = screen.getByRole("menuitem", { name: "Share" });
    expect(share).toHaveAttribute("data-disabled");
    fireEvent.click(share);
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("menuitem", { name: "Print" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  it("toggles a checkbox item with the Radix data-state values", () => {
    const onCheckedChange = vi.fn();
    render(
      <Menubar defaultValue="view">
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              closeOnSelect={false}
              onCheckedChange={onCheckedChange}
            >
              Sidebar
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const box = screen.getByRole("menuitemcheckbox", { name: /Sidebar/ });
    expect(box).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(box);

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(box).toHaveAttribute("data-state", "checked");
  });

  it("selects a radio item and reports its value as a string", () => {
    const onValueChange = vi.fn();
    render(
      <Menubar defaultValue="view">
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup onValueChange={onValueChange} value="a">
              <MenubarRadioItem value="a">Alpha</MenubarRadioItem>
              <MenubarRadioItem value="b">Beta</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(
      screen.getByRole("menuitemradio", { name: /Alpha/ }),
    ).toHaveAttribute("data-state", "checked");

    fireEvent.click(screen.getByRole("menuitemradio", { name: /Beta/ }));

    expect(onValueChange.mock.calls[0]?.[0]).toBe("b");
  });

  it("opens a submenu from its trigger", () => {
    render(
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger inset>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email link</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const subTrigger = screen.getByRole("menuitem", { name: /Share/ });
    expect(subTrigger).toHaveAttribute("data-state", "closed");
    expect(subTrigger).toHaveClass("pl-8");

    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "ArrowDown",
    });
    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "ArrowRight",
    });

    expect(subTrigger).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Email link")).toBeInTheDocument();
  });
});
