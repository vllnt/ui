import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScopeSelector } from "./scope-selector";

const nodes = [
  {
    children: [
      {
        children: [
          { id: "prod-us", label: "US East" },
          { id: "prod-eu", label: "EU West" },
        ],
        id: "production",
        label: "Production",
      },
      {
        children: [{ id: "staging-us", label: "US East" }],
        id: "staging",
        label: "Staging",
      },
    ],
    id: "environments",
    label: "Environments",
  },
  {
    children: [
      { id: "team-growth", label: "Growth" },
      { id: "team-data", label: "Data" },
    ],
    id: "teams",
    label: "Teams",
  },
];

describe("ScopeSelector", () => {
  it("renders the placeholder before a scope is selected", () => {
    render(<ScopeSelector nodes={nodes} placeholder="Pick a scope" />);

    expect(
      screen.getByRole("button", { name: /pick a scope/i }),
    ).toBeInTheDocument();
  });

  it("allows browsing nested scopes and selecting a leaf", () => {
    const handleValueChange = vi.fn();
    render(<ScopeSelector nodes={nodes} onValueChange={handleValueChange} />);

    fireEvent.click(screen.getByRole("button", { name: /select scope/i }));
    fireEvent.click(screen.getByRole("button", { name: /environments/i }));
    fireEvent.click(screen.getByRole("button", { name: /production/i }));
    fireEvent.click(screen.getByRole("button", { name: /eu west/i }));

    expect(handleValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        node: expect.objectContaining({ id: "prod-eu", label: "EU West" }),
      }),
    );
    expect(
      screen.getByRole("button", {
        name: /environments \/ production \/ eu west/i,
      }),
    ).toBeInTheDocument();
  });

  it("filters scopes from search", () => {
    render(<ScopeSelector nodes={nodes} />);

    fireEvent.click(screen.getByRole("button", { name: /select scope/i }));
    fireEvent.change(screen.getByPlaceholderText("Search scopes..."), {
      target: { value: "growth" },
    });

    expect(screen.getByRole("button", { name: /growth/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /production/i }),
    ).not.toBeInTheDocument();
  });
});
