import type { ReactNode } from "react";

import { named } from "../../../lib/named";

/** Props for {@link SiteMain}. */
export type SiteMainProps = {
  /** The page. */
  children: ReactNode;
  /** Classes for the `main` element, e.g. `flex-1` in a flex column body. */
  className?: string;
};

/**
 * The page landmark: `<main id="main" tabIndex={-1}>`. The skip link in
 * {@link SiteFrame} targets it, and the `tabIndex` lets the jump move focus
 * into it. A page has one.
 *
 * @example
 * <SiteMain className="flex-1">{children}</SiteMain>
 */
const SiteMain = /* @__PURE__ */ named(
  "SiteMain",
  ({ children, className }: SiteMainProps): React.ReactElement => (
    <main className={className} id="main" tabIndex={-1}>
      {children}
    </main>
  ),
);

export { SiteMain };
