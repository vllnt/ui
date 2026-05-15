import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MDXContent } from "./mdx-content";

describe("MDXContent", () => {
  it("renders GFM pipe tables as accessible tables", async () => {
    const content = [
      "| Name | Status |",
      "| --- | --- |",
      "| Design | Ready |",
    ].join("\n");

    render(await MDXContent({ content, enableMDX: false }));

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Design" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ready" })).toBeInTheDocument();
  });
});
