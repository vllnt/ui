import { expect, test } from "@playwright/experimental-ct-react";

import { type TreeNode, TreeView } from "./tree-view";

const NODES: TreeNode[] = [
  {
    id: "src",
    label: "src/",
    nodes: [
      {
        id: "components",
        label: "components/",
        nodes: [
          { id: "button", label: "Button.tsx" },
          { id: "card", label: "Card.tsx" },
        ],
      },
      { id: "utils", label: "utils/" },
    ],
  },
  { id: "package", label: "package.json" },
];

test.describe("TreeView Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <TreeView
        defaultExpanded={["src", "components"]}
        defaultSelected={["button"]}
        nodes={NODES}
      />,
    );
    await expect(component).toHaveScreenshot("tree-view-default.png");
  });
});
