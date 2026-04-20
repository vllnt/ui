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

  it("shows the selected option label", () => {
    render(<Combobox options={options} value="next.js" />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Next.js");
  });
});
