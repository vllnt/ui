import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";

afterEach(() => {
  vi.restoreAllMocks();
});

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
    [enabled, disabled].forEach((item) => {
      expect(item.className).not.toMatch(/data-\[disabled]:/);
      expect(item.className).toContain("data-[disabled=true]:opacity-50");
    });
  });
});

describe("CommandDialog", () => {
  it("returns focus to the element that opened it when closed with Escape", async () => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
    render(<PaletteHarness />);
    const opener = screen.getByRole("button", { name: "Open palette" });

    opener.focus();
    fireEvent.click(opener);
    const input = screen.getByPlaceholderText("Type a command");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it("is a dialog named Command Menu that holds the palette", () => {
    render(
      <CommandDialog defaultOpen>
        <CommandInput placeholder="Type a command" />
        <CommandList>
          <CommandItem>Profile</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Command Menu" });

    expect(dialog).toContainElement(screen.getByRole("listbox"));
    expect(dialog.querySelector("[cmdk-root]")).not.toBeNull();
  });

  it("runs an item and reports the dialog closing through onOpenChange", () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CommandDialog defaultOpen onOpenChange={onOpenChange}>
        <CommandList>
          <CommandItem onSelect={onSelect} value="profile">
            Profile
          </CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    fireEvent.click(screen.getByRole("option", { name: "Profile" }));

    expect(onSelect).toHaveBeenCalledWith("profile");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("CommandSeparator", () => {
  it("keeps the listbox free of separator roles and hides while searching", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>First</CommandItem>
          <CommandSeparator data-testid="separator" />
          <CommandItem>Second</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(
      screen.getByRole("listbox").querySelector("[role=separator]"),
    ).toBeNull();
    expect(screen.getByTestId("separator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "fir" },
    });
    expect(container.querySelector("[data-testid=separator]")).toBeNull();
  });
});

describe("CommandInput focus", () => {
  it("marks the input row when the input has focus (WCAG 2.4.7)", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
      </Command>,
    );
    const wrapper = screen
      .getByPlaceholderText("Search")
      .closest("[cmdk-input-wrapper]");
    expect(wrapper).toHaveClass("focus-within:border-ring");
  });
});

const names = () =>
  screen.queryAllByRole("option").map((option) => option.textContent);

describe("Command cmdk-style API", () => {
  it("emits the cmdk attributes that styles and tests select on", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const item = screen.getByRole("option", { name: "Calendar" });

    expect(container.querySelector("[cmdk-root]")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search")).toHaveAttribute(
      "cmdk-input",
      "",
    );
    expect(screen.getByRole("listbox")).toHaveAttribute("cmdk-list", "");
    expect(item).toHaveAttribute("cmdk-item", "");
    expect(item.closest("[cmdk-group]")).not.toBeNull();
    expect(container.querySelector("[cmdk-group-heading]")).toHaveTextContent(
      "Suggestions",
    );
  });

  it("names the list Suggestions unless a label is given", () => {
    const { rerender } = render(
      <Command>
        <CommandList>
          <CommandItem>One</CommandItem>
        </CommandList>
      </Command>,
    );

    expect(
      screen.getByRole("listbox", { name: "Suggestions" }),
    ).toBeInTheDocument();
    rerender(
      <Command label="Models">
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>One</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByRole("listbox", { name: "Models" })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Models" }),
    ).toBeInTheDocument();
  });

  it("filters by the item value and keywords, and shows the empty state", async () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>Nothing found</CommandEmpty>
          <CommandItem keywords={["mail"]} value="inbox">
            Inbox
          </CommandItem>
          <CommandItem value="calendar">Calendar</CommandItem>
        </CommandList>
      </Command>,
    );
    const input = screen.getByPlaceholderText("Search");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Inbox" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
    expect(screen.queryByText("Nothing found")).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: "cal" } });
    expect(names()).toEqual(["Calendar"]);
    fireEvent.change(input, { target: { value: "mail" } });
    expect(names()).toEqual(["Inbox"]);
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(names()).toEqual([]);
    expect(await screen.findByText("Nothing found")).toBeInTheDocument();
  });

  it("filters on the value, not the visible text, when a value is given", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="alpha beta">Shown text</CommandItem>
        </CommandList>
      </Command>,
    );
    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "beta" } });
    expect(names()).toEqual(["Shown text"]);
    fireEvent.change(input, { target: { value: "shown" } });
    expect(names()).toEqual([]);
  });

  it("keeps every item when shouldFilter is false", () => {
    render(
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>Alpha</CommandItem>
          <CommandItem>Beta</CommandItem>
        </CommandList>
      </Command>,
    );
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "zzz" },
    });

    expect(names()).toEqual(["Alpha", "Beta"]);
  });

  it("calls onSelect with the value, or the text when there is no value", () => {
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem onSelect={onSelect} value=" with-value ">
            One
          </CommandItem>
          <CommandItem onSelect={onSelect}>Two</CommandItem>
        </CommandList>
      </Command>,
    );
    fireEvent.click(screen.getByRole("option", { name: "One" }));
    fireEvent.click(screen.getByRole("option", { name: "Two" }));

    expect(onSelect).toHaveBeenNthCalledWith(1, "with-value");
    expect(onSelect).toHaveBeenNthCalledWith(2, "Two");
  });

  it("does not run a disabled item", () => {
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem disabled onSelect={onSelect}>
            Locked
          </CommandItem>
        </CommandList>
      </Command>,
    );
    fireEvent.click(screen.getByRole("option", { name: "Locked" }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("highlights the first item, moves with the arrow keys and runs it with Enter", async () => {
    const onSelect = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Command onValueChange={onValueChange}>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="first">First</CommandItem>
          <CommandItem onSelect={onSelect} value="second">
            Second
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const input = screen.getByPlaceholderText("Search");
    input.focus();
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "First" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("second");
    expect(onSelect).toHaveBeenCalledWith("second");
  });

  it("controls the search text with value and onValueChange on the input", () => {
    const onValueChange = vi.fn();
    const view = (value: string) => (
      <Command>
        <CommandInput
          onValueChange={onValueChange}
          placeholder="Search"
          value={value}
        />
        <CommandList>
          <CommandItem>Alpha</CommandItem>
          <CommandItem>Beta</CommandItem>
        </CommandList>
      </Command>
    );
    const { rerender } = render(view("alp"));

    expect(screen.getByPlaceholderText("Search")).toHaveValue("alp");
    expect(names()).toEqual(["Alpha"]);
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "bet" },
    });
    expect(onValueChange).toHaveBeenCalledWith("bet");
    rerender(view("bet"));
    expect(names()).toEqual(["Beta"]);
    rerender(view(""));
    expect(names()).toEqual(["Alpha", "Beta"]);
  });

  it("hides a group while none of its items matches", async () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandGroup heading="Letters">
            <CommandItem>Alpha</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Numbers">
            <CommandItem>One</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "alp" },
    });

    await waitFor(() => {
      expect(screen.getByText("Numbers")).not.toBeVisible();
    });
    expect(screen.getByText("Letters")).toBeVisible();
  });

  it("renders an asChild item as its child element", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem asChild>
            <a href="#go">Go there</a>
          </CommandItem>
        </CommandList>
      </Command>,
    );

    expect(screen.getByRole("option", { name: "Go there" }).tagName).toBe("A");
  });
});

describe("CommandSeparator alwaysRender", () => {
  it("keeps the separator while searching when alwaysRender is set", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>First</CommandItem>
          <CommandSeparator alwaysRender data-testid="separator" />
          <CommandItem>Second</CommandItem>
        </CommandList>
      </Command>,
    );
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "fir" },
    });

    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });
});

describe("CommandEmpty layout", () => {
  it("is an empty live region that takes no padding while items match", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandItem>First</CommandItem>
        </CommandList>
      </Command>,
    );
    const status = screen.getByRole("status");

    expect(status).toBeEmptyDOMElement();
    expect(status).toHaveClass("py-6", "empty:py-0");
  });
});
