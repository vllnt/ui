import { expect, test } from "@playwright/experimental-ct-react";

import { DocumentSiblingNav } from "./document-sibling-nav";

const FOO = { href: "/posts/foo", title: "Why thin clients are back" };
const BAR = { href: "/posts/bar", title: "What we shipped this quarter" };

test.describe("DocumentSiblingNav Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <DocumentSiblingNav next={BAR} previous={FOO} />,
    );
    await expect(component).toHaveScreenshot("document-sibling-nav-default.png");
  });

  test("only-previous", async ({ mount }) => {
    const component = await mount(<DocumentSiblingNav previous={FOO} />);
    await expect(component).toHaveScreenshot(
      "document-sibling-nav-only-previous.png",
    );
  });

  test("only-next", async ({ mount }) => {
    const component = await mount(<DocumentSiblingNav next={BAR} />);
    await expect(component).toHaveScreenshot(
      "document-sibling-nav-only-next.png",
    );
  });

  test("variant-compact", async ({ mount }) => {
    const component = await mount(
      <DocumentSiblingNav next={BAR} previous={FOO} variant="compact" />,
    );
    await expect(component).toHaveScreenshot(
      "document-sibling-nav-variant-compact.png",
    );
  });

  test("variant-with-meta", async ({ mount }) => {
    const component = await mount(
      <DocumentSiblingNav
        next={{ ...BAR, meta: "May 2026" }}
        previous={{ ...FOO, meta: "April 2026" }}
        variant="with-meta"
      />,
    );
    await expect(component).toHaveScreenshot(
      "document-sibling-nav-variant-with-meta.png",
    );
  });
});
