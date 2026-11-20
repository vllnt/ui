import { describe, expect, it } from "vitest";

import {
  leadingMarkdownHeading,
  stripLeadingMarkdownHeading,
} from "@/lib/markdown";

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

describe("leadingMarkdownHeading", () => {
  it("returns the text of the document title", () => {
    expect(leadingMarkdownHeading("\n# React Native\n\nBody")).toBe(
      "React Native",
    );
  });

  it("trims the title", () => {
    expect(leadingMarkdownHeading("#   Spaced out   \n\nBody")).toBe(
      "Spaced out",
    );
  });

  it("is undefined when the content does not begin with a title", () => {
    expect(leadingMarkdownHeading("## Setup\n\nBody")).toBeUndefined();
    expect(leadingMarkdownHeading("Body\n\n# Later title")).toBeUndefined();
    expect(leadingMarkdownHeading("")).toBeUndefined();
  });

  it("agrees with stripLeadingMarkdownHeading on what a title is", () => {
    const content = "# Same rule\n\nBody";

    expect(leadingMarkdownHeading(content)).toBe("Same rule");
    expect(stripLeadingMarkdownHeading(content)).toBe("Body");
  });
});
