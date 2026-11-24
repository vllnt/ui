import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("renders the trigger as a combobox with the placeholder but keeps the menu closed by default", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="a">Apple</SelectItem>
            <SelectItem value="b">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Pick")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });

  it("shows the selected item's text on the closed trigger", () => {
    render(
      <Select defaultValue="b">
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
          <SelectItem value="b">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
    expect(screen.queryByText("Pick")).not.toBeInTheDocument();
  });

  it("reads an empty string value as nothing selected, like Radix", () => {
    render(
      <Select value="">
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick");
    expect(screen.getByRole("combobox")).toHaveAttribute("data-placeholder");
  });

  it("shows SelectValue children only once a value is selected", () => {
    const { rerender } = render(
      <Select value="">
        <SelectTrigger>
          <SelectValue placeholder="Pick">Custom</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick");

    rerender(
      <Select value="a">
        <SelectTrigger>
          <SelectValue placeholder="Pick">Custom</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Custom");
  });

  it("opens on press, reports the chosen value as a string and closes", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Select onOpenChange={onOpenChange} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
          <SelectItem value="b">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-state", "closed");

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute("data-state", "open");

    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await act(async () => {
      await Promise.resolve();
    });
    expect(trigger).toHaveTextContent("Banana");
  });

  it("emits the Radix state attributes and className on the open parts", () => {
    render(
      <Select defaultOpen defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="extra">
          <SelectItem value="a">Apple</SelectItem>
          <SelectItem disabled value="b">
            Banana
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("listbox")).toHaveAttribute("data-state", "open");
    expect(screen.getByRole("listbox")).toHaveClass("extra");
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
      "data-state",
      "checked",
    );
    const banana = screen.getByRole("option", { name: "Banana" });
    expect(banana).toHaveAttribute("data-state", "unchecked");
    expect(banana).toHaveAttribute("data-disabled");
  });

  it("names the group by its label and renders a separator", async () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="a">Apple</SelectItem>
          </SelectGroup>
          <SelectSeparator data-testid="separator" />
          <SelectItem value="b">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(
      await screen.findByRole("group", { name: "Fruits" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("separator")).toHaveClass("bg-border");
  });

  it("forwards the content ref and keeps item text from textValue for typeahead labels", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Select defaultOpen defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent ref={ref}>
          <SelectItem textValue="Apple" value="a">
            <em>Apple!</em>
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(ref.current).toBe(screen.getByRole("listbox"));
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
  });

  it("closes on Escape and reports it as a boolean", () => {
    const onOpenChange = vi.fn();
    render(
      <Select defaultOpen onOpenChange={onOpenChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls[0]).toHaveLength(1);
  });

  it("lets onEscapeKeyDown keep the list open with preventDefault", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent onEscapeKeyDown={onEscapeKeyDown}>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    fireEvent.keyDown(screen.getByRole("listbox"), {
      key: "Escape",
    });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-state", "open");
  });
});

describe("Select validity", () => {
  it("marks an invalid trigger with the destructive border, never on words", () => {
    render(
      <Select>
        <SelectTrigger aria-invalid="true" aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveClass("aria-[invalid=true]:border-destructive");
    expect(trigger.className).not.toMatch(/(?:^|\s)text-destructive(?:\s|$)/);
  });
});
