import type { ReactNode } from "react";

import { named } from "../../../lib/named";
import { SiteMain } from "../../atoms/site-main/site-main";
import { SkipLink } from "../../atoms/skip-link/skip-link";
import { SiteThemeProvider } from "../../molecules/site-frame/site-frame";

/** Props for {@link SiteShellStatic}. */
export type SiteShellStaticProps = {
  /** The page. */
  children: ReactNode;
  /** The footer: `SiteFooter`, or the app's own component around it. */
  footer: ReactNode;
  /** The header: `SiteHeaderStatic`, or the app's own component around it. */
  header: ReactNode;
  /** Classes for the `main` element, e.g. `flex-1` in a flex column body. */
  mainClassName?: string;
  /** The text of the skip link, which jumps to the page. */
  skipLabel: string;
};

/**
 * The shell of a site that hydrates no part of the shell: the theme provider,
 * the skip link, the header, the page and the footer, in the order of
 * `SiteShell`. It has no settings, because a setting is a control that needs
 * script, so the site follows the system.
 *
 * It lives in its own module and never imports the theme control: a page that
 * renders this shell ships none of the control's code. Pair it with
 * `SiteHeaderStatic`.
 *
 * The theme provider puts the `dark` or `light` class on `<html>` with its one
 * inline script, before the first paint. It leaves `color-scheme` to the
 * stylesheet of the app, which follows the system as it changes; on a page that
 * runs no script, the provider reads the system once. Inside a theme provider
 * of the app, this one adds nothing.
 *
 * @example
 * <SiteShellStatic
 *   footer={<SiteFooter {...footer} />}
 *   header={<SiteHeaderStatic {...header} />}
 *   skipLabel="Skip to content"
 * >
 *   {children}
 * </SiteShellStatic>
 */
const SiteShellStatic = /* @__PURE__ */ named(
  "SiteShellStatic",
  ({
    children,
    footer,
    header,
    mainClassName,
    skipLabel,
  }: SiteShellStaticProps): React.ReactElement => (
    <SiteThemeProvider enableColorScheme={false}>
      <SkipLink>{skipLabel}</SkipLink>
      {header}
      <SiteMain
        {...(mainClassName === undefined ? {} : { className: mainClassName })}
      >
        {children}
      </SiteMain>
      {footer}
    </SiteThemeProvider>
  ),
);

export { SiteShellStatic };
