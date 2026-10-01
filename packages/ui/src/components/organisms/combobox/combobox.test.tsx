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
      screen.getByRole("combobox", { name: "Framework" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Runtime" }),
    ).toBeInTheDocument();
  });

  it("names its popover dialog and points aria-controls at it when open", () => {
    render(<Combobox aria-label="Framework" options={options} />);
    const trigger = screen.getByRole("combobox", { name: "Framework" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
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
