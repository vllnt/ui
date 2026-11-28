import type { ReactNode } from "react";

import { named } from "../../../lib/named";
import { PAGE_COLUMN } from "../../../lib/shell-layout";

/** Props for {@link SkipLink}. */
export type SkipLinkProps = {
  /** The text of the link. */
  children: ReactNode;
  /** The element it jumps to. Defaults to `#main`, which `SiteMain` carries. */
  href?: string;
};

/**
 * Hidden until it has focus. Then it shows fixed at the content edge: it sits
 * in a page column, and a fixed box with no `left` keeps the left of its place
 * in the flow. The global `:focus-visible` outline draws the ring.
 */
const SKIP_LINK =
  "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground";

/**
 * The first tab stop of a page: it stays hidden until it has focus, then jumps
 * past the header to `href`. It sits in a page column, at the content edge.
 *
 * Put it first in `body`, before the header. {@link SiteFrame} and the site
 * shells do that for you.
 *
 * @example
 * <SkipLink>Skip to content</SkipLink>
 */
const SkipLink = /* @__PURE__ */ named(
  "SkipLink",
  ({ children, href = "#main" }: SkipLinkProps): React.ReactElement => (
    <div className={PAGE_COLUMN}>
      <a className={SKIP_LINK} href={href}>
        {children}
      </a>
    </div>
  ),
);

export { SkipLink };
