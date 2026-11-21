import { describe, expect, it } from "vitest";

import { storybookSandbox } from "./storybook-sandbox";

describe("storybookSandbox", () => {
  it.each([
    ["https://storybook.example/iframe.html?id=a", "https://docs.example"],
    ["http://localhost:6006/iframe.html", "http://localhost:3000"],
    ["https://docs.example:8443/iframe.html", "https://docs.example"],
    ["http://docs.example/iframe.html", "https://docs.example"],
  ])("lets %s keep its own origin on %s", (frame, page) => {
    expect(storybookSandbox(frame, page)).toBe(
      "allow-scripts allow-same-origin",
    );
  });

  it("never pairs scripts with same-origin for a story served from the page's origin", () => {
    expect(
      storybookSandbox(
        "https://docs.example/storybook/iframe.html",
        "https://docs.example",
      ),
    ).toBe("allow-scripts");
  });

  it("grants nothing beyond scripts and the story's own origin", () => {
    const sandbox = storybookSandbox(
      "https://storybook.example/iframe.html",
      "https://docs.example",
    );

    expect(sandbox.split(" ").sort()).toEqual([
      "allow-same-origin",
      "allow-scripts",
    ]);
  });
});
