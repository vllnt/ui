import type { ReactNode } from "react";

import { named } from "../../../lib/named";
import { SiteMain } from "../../atoms/site-main/site-main";
import { SiteFrame } from "../../molecules/site-frame/site-frame";
import { ThemeBar } from "../../molecules/theme-bar/theme-bar";

/**
 * What a visitor can set on a site. Each key holds the text of one setting, and
 * never the props of the component that shows it today.
 */
export type SiteShellSettings = {
  /**
   * The theme control and its text. Without it the site has no control and
   * follows the system.
   */
  theme?: {
    label: string;
    /** The text of each choice. */
    options: Record<"dark" | "light" | "system", string>;
  };
};

/** Props for {@link SiteShell}. */
export type SiteShellProps = {
  /** The page. */
  children: ReactNode;
  /** The footer: `SiteFooter`, or the app's own component around it. */
  footer: ReactNode;
  /** The header: `SiteHeader`, or the app's own component around it. */
  header: ReactNode;
  /** Classes for the `main` element, e.g. `flex-1` in a flex column body. */
  mainClassName?: string;
  /** The settings the site offers. The shell decides where each one sits. */
  settings?: SiteShellSettings;
  /** The text of the skip link, which jumps to the page. */
  skipLabel: string;
};

/**
 * The whole shell of a site, inside `body`: the theme provider, the skip link,
 * the header, the page, the footer and the settings. It holds no brand, link or
 * copy: the header and footer you pass carry them.
 *
 * An app gives the parts and their text; the shell decides the order and where
 * each part sits. So a part that moves in the design (the theme control into a
 * settings panel, say) moves here, and no app layout changes.
 *
 * The order is the skip link, the header, `main#main`, the footer and the theme
 * bar. The footer sits outside `main`. The app keeps `html` and `body`, its
 * fonts and its own providers.
 *
 * @example
 * <SiteShell
 *   footer={<SiteFooter {...footer} />}
 *   header={<SiteHeader {...header} />}
 *   settings={{
 *     theme: {
 *       label: "Theme",
 *       options: { dark: "Dark", light: "Light", system: "System" },
 *     },
 *   }}
 *   skipLabel="Skip to content"
 * >
 *   {children}
 * </SiteShell>
 */
const SiteShell = /* @__PURE__ */ named(
  "SiteShell",
  ({
    children,
    footer,
    header,
    mainClassName,
    settings,
    skipLabel,
  }: SiteShellProps): React.ReactElement => (
    <SiteFrame skipLabel={skipLabel}>
      {header}
      <SiteMain
        {...(mainClassName === undefined ? {} : { className: mainClassName })}
      >
        {children}
      </SiteMain>
      {footer}
      {settings?.theme ? <ThemeBar {...settings.theme} /> : null}
    </SiteFrame>
  ),
);

export { SiteShell };
