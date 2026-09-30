import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { expect, it } from "vitest";

import { Grid } from "./grid";

it.each<[string, ComponentProps<typeof Grid>, string[]]>([
  ["defaults", {}, ["grid", "grid-cols-1", "gap-4"]],
  ["cols and gap", { cols: 3, gap: 6 }, ["grid-cols-3", "gap-6"]],
  [
    "responsive breakpoints",
    { cols: 1, lgCols: 4, mdCols: 2, smCols: 2 },
    ["grid-cols-1", "sm:grid-cols-2", "md:grid-cols-2", "lg:grid-cols-4"],
  ],
  ["custom className", { className: "custom-class" }, ["custom-class"]],
])("Grid maps %s to classes", (_name, props, classes) => {
  const { container } = render(<Grid {...props}>content</Grid>);
  expect(container.firstChild).toHaveClass(...classes);
});
