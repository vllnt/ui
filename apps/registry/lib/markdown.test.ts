import { describe, expect, it } from "vitest";

import { stripLeadingMarkdownHeading } from "@/lib/markdown";

describe("stripLeadingMarkdownHeading", () => {
  it("removes the document title rendered by the page shell", () => {
    expect(stripLeadingMarkdownHeading("\n# React Native\n\nBody")).toBe(
      "Body",
    );
  });

  it("preserves content that does not begin with a title", () => {
    expect(stripLeadingMarkdownHeading("## Setup\n\nBody")).toBe(
      "## Setup\n\nBody",
    );
  });
});
