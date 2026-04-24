import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./multi-select";

const OPTIONS = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { disabled: true, label: "Svelte", value: "svelte" },
];

class ResizeObserverMock {
  observe() {
    return;
  }

  disconnect() {
    return;
  }

  unobserve() {
    return;
  }
}

beforeAll(() => {
  if (window.ResizeObserver === undefined) {
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      value: ResizeObserverMock,
      writable: true,
    });
  }

  if (HTMLElement.prototype.scrollIntoView === undefined) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
      writable: true,
    });
  }
});

describe("MultiSelect", () => {
  it("supports uncontrolled selection and displays the selected value", () => {
    render(
      <MultiSelect
        defaultValue={["react"]}
        options={OPTIONS}
        placeholder="Pick frameworks"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("React");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Vue" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("React");
    expect(screen.getByRole("combobox")).toHaveTextContent("Vue");
  });

  it("supports controlled selection via onValueChange", () => {
    const handleValueChange = vi.fn();

    render(
      <MultiSelect
        onValueChange={handleValueChange}
        options={OPTIONS}
        value={["react"]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Vue" }));

    expect(handleValueChange).toHaveBeenCalledWith(["react", "vue"]);
    expect(screen.getByRole("combobox")).not.toHaveTextContent("Vue");
  });

  it("prevents interaction when disabled", () => {
    render(<MultiSelect disabled options={OPTIONS} />);

    const trigger = screen.getByRole("combobox");

    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens from the keyboard and exposes multi-select accessibility state", () => {
    render(<MultiSelect options={OPTIONS} searchable />);

    const trigger = screen.getByRole("combobox");

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    );

    const selectedOption = screen.getByRole("option", { name: "React" });
    const disabledOption = screen.getByRole("option", { name: "Svelte" });

    fireEvent.click(selectedOption);

    expect(selectedOption).toHaveAttribute("aria-selected", "true");
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  });
});
