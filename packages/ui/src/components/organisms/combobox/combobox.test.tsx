import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Combobox } from "./combobox";

const options = [
  { label: "Next.js", value: "next.js" },
  { label: "React", value: "react" },
  { label: "SvelteKit", value: "sveltekit" },
];

describe("Combobox", () => {
  it("renders placeholder text", () => {
    render(<Combobox options={options} placeholder="Select framework" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Select framework");
  });

  it("calls onValueChange when an option is selected", () => {
    const onValueChange = vi.fn();
    render(<Combobox onValueChange={onValueChange} options={options} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("React"));
    expect(onValueChange).toHaveBeenCalledWith("react");
  });

  it("forwards an accessible name and id to the trigger", () => {
    render(
      <>
        <label htmlFor="framework">Framework</label>
        <Combobox id="framework" options={options} />
        <Combobox aria-label="Runtime" options={options} />
      </>,
    );
    expect(
      screen.getByRole("combobox", { name: "Framework Select an option" }),
    ).toHaveAttribute("id", "framework");
    expect(
      screen.getByRole("combobox", { name: "Runtime Select an option" }),
    ).toBeInTheDocument();
  });

  it("keeps the chosen option in the trigger's name, whichever way it is named", () => {
    render(
      <>
        <label htmlFor="by-label">Framework</label>
        <Combobox id="by-label" options={options} value="react" />
        <Combobox aria-label="Runtime" options={options} value="react" />
        <span id="stack">Stack</span>
        <Combobox aria-labelledby="stack" options={options} value="react" />
      </>,
    );
    expect(
      screen.getByRole("combobox", { name: "Framework React" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Runtime React" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Stack React" }),
    ).toBeInTheDocument();
  });

  it("marks the chosen option checked, whichever option is highlighted", () => {
    render(<Combobox aria-label="Framework" options={options} value="react" />);
    fireEvent.click(screen.getByRole("combobox"));
    const checked = () =>
      screen
        .getAllByRole("option")
        .map((option) => option.getAttribute("aria-checked"));
    expect(checked()).toEqual(["false", "true", "false"]);
    // The highlight moves on its own and leaves the chosen option alone.
    fireEvent.keyDown(screen.getByPlaceholderText("Search options..."), {
      key: "ArrowDown",
    });
    expect(checked()).toEqual(["false", "true", "false"]);
  });

  it("names its popover dialog and points aria-controls at it when open", () => {
    render(<Combobox aria-label="Framework" options={options} />);
    const trigger = screen.getByRole("combobox", {
      name: "Framework Select an option",
    });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-controls");
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Framework" });
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
  });

  it("accepts a custom popover label", () => {
    render(
      <Combobox
        aria-label="Framework"
        options={options}
        popoverLabel="Choose a framework"
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(
      screen.getByRole("dialog", { name: "Choose a framework" }),
    ).toBeInTheDocument();
  });

  it("shows the selected option label", () => {
    render(<Combobox options={options} value="next.js" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Next.js");
  });
});

describe("Combobox state props", () => {
  it("starts on defaultValue and follows the user's choice", () => {
    render(<Combobox defaultValue="react" options={options} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("React");
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("SvelteKit"));
    expect(screen.getByRole("combobox")).toHaveTextContent("SvelteKit");
  });

  it("starts open with defaultOpen", () => {
    render(<Combobox defaultOpen options={options} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("reports open changes and follows `open` when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Combobox onOpenChange={onOpenChange} open={false} options={options} />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<Combobox onOpenChange={onOpenChange} open options={options} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("disables the trigger", () => {
    render(<Combobox disabled options={options} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
