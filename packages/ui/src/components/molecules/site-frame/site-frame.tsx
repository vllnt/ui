import type { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";

import { named } from "../../../lib/named";
import { SkipLink } from "../../atoms/skip-link/skip-link";
import { ThemeProvider } from "../../atoms/theme-provider/theme-provider";

/** Props for {@link SiteFrame}. */
export type SiteFrameProps = {
  /** The header, a `SiteMain`, the footer and the theme bar, in that order. */
  children: ReactNode;
  /** The text of the skip link, which jumps to the page. */
  skipLabel: string;
};

/**
 * `next-themes` set up for a site shell: the `class` attribute, the system
 * theme by default, and no transition when the theme changes. Any prop replaces
 * its setting.
 *
 * @example
 * <SiteThemeProvider enableColorScheme={false}>{children}</SiteThemeProvider>
 */
const SiteThemeProvider = /* @__PURE__ */ named(
  "SiteThemeProvider",
  (props: ThemeProviderProps): React.ReactElement => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      {...props}
    />
  ),
);

/**
 * The theme provider and the skip link around the body of every page: the
 * default composition of {@link SiteThemeProvider} and `SkipLink`. The skip link
 * jumps to `SiteMain`. The app keeps the `html` and `body` elements, its fonts
 * and its providers.
 *
 * @example
 * <SiteFrame skipLabel="Skip to content">
 *   <header />
 *   <SiteMain>{children}</SiteMain>
 * </SiteFrame>
 */
const SiteFrame = /* @__PURE__ */ named(
  "SiteFrame",
  ({ children, skipLabel }: SiteFrameProps): React.ReactElement => (
    <SiteThemeProvider>
      <SkipLink>{skipLabel}</SkipLink>
      {children}
    </SiteThemeProvider>
  ),
);

export { SiteFrame, SiteThemeProvider };
