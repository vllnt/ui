import { createElement } from "react";

import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { usePathname } from "next/navigation";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

function usePathnameProbe() {
  return createElement("span", undefined, usePathname());
}

/**
 * `PlatformSidebar` gives the library sidebar the public pathname by providing
 * Next's `PathnameContext`, because `Sidebar` takes no pathname prop. The
 * context lives in a Next internal module that an upgrade can move. These
 * tests fail when it moves, so a regression of the sidebar to marking the wrong
 * page on prerendered pages comes with a red build.
 */
describe("the Next context behind usePathname", () => {
  it("stays exported from the internal module", () => {
    expect(PathnameContext).toBeDefined();
  });

  it("is the context that usePathname reads", () => {
    const html = renderToString(
      createElement(
        PathnameContext,
        { value: "/provided-by-the-test" },
        createElement(usePathnameProbe),
      ),
    );

    expect(html).toContain("/provided-by-the-test");
  });
});
