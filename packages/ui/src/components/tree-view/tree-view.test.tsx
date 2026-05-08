import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type TreeNode, TreeView } from "./tree-view";

const NODES: TreeNode[] = [
  {
    id: "src",
    label: "src/",
    nodes: [
      {
        id: "components",
        label: "components/",
        nodes: [{ id: "button", label: "Button.tsx" }],
      },
      { id: "utils", label: "utils/" },
    ],
  },
  { disabled: true, id: "node_modules", label: "node_modules/" },
];

describe("TreeView", () => {
  describe("rendering", () => {
    it("renders only top-level nodes when nothing is expanded", () => {
      render(<TreeView nodes={NODES} />);

      expect(screen.getByText("src/")).toBeInTheDocument();
      expect(screen.getByText("node_modules/")).toBeInTheDocument();
      expect(screen.queryByText("components/")).toBeNull();
    });

    it("renders descendants when ancestors are in defaultExpanded", () => {
      render(<TreeView defaultExpanded={["src"]} nodes={NODES} />);

      expect(screen.getByText("components/")).toBeInTheDocument();
      expect(screen.getByText("utils/")).toBeInTheDocument();
      expect(screen.queryByText("Button.tsx")).toBeNull();
    });

    it("emits ARIA tree role and aria-expanded on branches", () => {
      render(<TreeView nodes={NODES} />);

      const tree = screen.getByRole("tree");
      expect(tree).toBeInTheDocument();
      const branch = screen.getByText("src/").closest("li");
      expect(branch).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("interaction", () => {
    it("toggles expand on branch click", () => {
      render(<TreeView nodes={NODES} />);

      fireEvent.click(screen.getByText("src/"));
      expect(screen.getByText("components/")).toBeInTheDocument();

      fireEvent.click(screen.getByText("src/"));
      expect(screen.queryByText("components/")).toBeNull();
    });

    it("fires onSelect with the leaf id on click (single mode)", () => {
      const onSelect = vi.fn();
      render(
        <TreeView
          defaultExpanded={["src", "components"]}
          nodes={NODES}
          onSelect={onSelect}
        />,
      );

      fireEvent.click(screen.getByText("Button.tsx"));
      expect(onSelect).toHaveBeenCalledWith(["button"]);
    });

    it("toggles selection per-id when selectionMode is multiple", () => {
      const onSelect = vi.fn();
      render(
        <TreeView
          defaultExpanded={["src", "components"]}
          nodes={NODES}
          onSelect={onSelect}
          selectionMode="multiple"
        />,
      );

      fireEvent.click(screen.getByText("Button.tsx"));
      fireEvent.click(screen.getByText("utils/"));
      expect(onSelect).toHaveBeenLastCalledWith(["button", "utils"]);

      fireEvent.click(screen.getByText("Button.tsx"));
      expect(onSelect).toHaveBeenLastCalledWith(["utils"]);
    });

    it("ignores clicks on disabled nodes", () => {
      const onSelect = vi.fn();
      render(<TreeView nodes={NODES} onSelect={onSelect} />);

      fireEvent.click(screen.getByText("node_modules/"));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("controlled state", () => {
    it("respects controlled expanded prop", () => {
      const onExpandedChange = vi.fn();
      const { rerender } = render(
        <TreeView
          expanded={[]}
          nodes={NODES}
          onExpandedChange={onExpandedChange}
        />,
      );

      fireEvent.click(screen.getByText("src/"));
      expect(onExpandedChange).toHaveBeenCalledWith(["src"]);
      expect(screen.queryByText("components/")).toBeNull();

      rerender(
        <TreeView
          expanded={["src"]}
          nodes={NODES}
          onExpandedChange={onExpandedChange}
        />,
      );
      expect(screen.getByText("components/")).toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowDown moves the active row", () => {
      const { container } = render(<TreeView nodes={NODES} />);
      const tree = container.querySelector("ul[role='tree']");
      expect(tree).not.toBeNull();
      if (!tree) return;

      expect(
        container.querySelector("[data-node-id='src'][data-active='true']"),
      ).toBeInTheDocument();

      fireEvent.keyDown(tree, { key: "ArrowDown" });
      expect(
        container.querySelector(
          "[data-node-id='node_modules'][data-active='true']",
        ),
      ).toBeInTheDocument();
    });

    it("Enter expands a branch and selects a leaf", () => {
      const onSelect = vi.fn();
      const { container } = render(
        <TreeView
          defaultExpanded={["src", "components"]}
          nodes={NODES}
          onSelect={onSelect}
        />,
      );
      const tree = container.querySelector("ul[role='tree']");
      if (!tree) return;

      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "Enter" });

      expect(onSelect).toHaveBeenCalledWith(["button"]);
    });
  });
});
