import Link from "next/link";
import type { ReactNode } from "react";

import { named } from "../../../lib/named";
import { PAGE_COLUMN } from "../../../lib/shell-layout";
import type { ShellMaterial } from "../../../lib/shell-material";
import { cn } from "../../../lib/utils";
import { Link as UiLink } from "../../atoms/link/link";
import { Separator } from "../../atoms/separator/separator";

/** One link of a footer column. */
export type SiteFooterLink = {
  /** Marks a link to another site: it gets a ↗ and the `otherSite` label. */
  external?: boolean;
  href: string;
  label: string;
};

/** One column of the footer: a heading and its links. */
export type SiteFooterColumn = {
  heading: string;
  /** Names the column; its heading gets `footer-${id}`. */
  id: string;
  links: readonly SiteFooterLink[];
};

/** Props for {@link SiteFooter}. */
export type SiteFooterProps = {
  /**
   * A row under the columns, e.g. the legal line, in small muted text. The
   * footer has no such row without it.
   */
  bottom?: ReactNode;
  /**
   * What the first block shows above the tagline: the name or lockup of the
   * site. Required. The footer has no default brand.
   */
  brand: ReactNode;
  /**
   * The link columns, in order. The footer shows every column in the list, from
   * one to five: up to four share four tracks, so a column is as wide on every
   * site; five take five tracks from 1200 px.
   */
  columns: readonly SiteFooterColumn[];
  /**
   * Kept so a site written against an older footer keeps compiling. Both
   * values render the flat footer: it has no surface of its own and sits on the
   * page, under a hairline.
   */
  material?: ShellMaterial;
  /** Names the footer's navigation. */
  navLabel: string;
  /** Read after the text of an external link, e.g. `other site`. */
  otherSite: string;
  tagline: string;
};

/**
 * The grid of the columns. Up to four columns share four tracks, so a column is
 * as wide on every site. A fifth column takes five tracks from 1200 px, three
 * from 768 px and two below, where the fifth sits on a row of its own.
 */
function columnsGrid(count: number): string {
  return count > 4
    ? "grid flex-1 grid-cols-2 gap-6 md:grid-cols-3 min-[1200px]:grid-cols-5"
    : "grid flex-1 grid-cols-2 gap-6 md:grid-cols-4";
}

/** The footer link: the library `Link` bar size, quiet, with no underline. */
const LINK_CLASS = "font-normal hover:no-underline";

function FooterLinkItem({
  link,
  otherSite,
}: {
  link: SiteFooterLink;
  otherSite: string;
}): React.ReactElement {
  if (link.external) {
    return (
      <UiLink asChild className={LINK_CLASS} size="lg" variant="muted">
        <a href={link.href}>
          {link.label}
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> ({otherSite})</span>
        </a>
      </UiLink>
    );
  }
  return (
    <UiLink asChild className={LINK_CLASS} size="lg" variant="muted">
      <Link href={link.href}>{link.label}</Link>
    </UiLink>
  );
}

/**
 * The footer of a site: a brand block with a tagline, one to five link columns
 * and an optional bottom row. Everything it shows comes in through props; the
 * footer holds no brand, link or copy of its own.
 *
 * It renders a `<footer>` landmark, so keep it outside `<main>`. The column
 * headings are `<h2>`, and each heading labels the list of its column. A
 * link marked `external` is a plain anchor with a ↗ and the `otherSite` text for
 * screen readers; the others go through `next/link`.
 *
 * @example
 * <SiteFooter
 *   brand="Acme"
 *   columns={[
 *     {
 *       heading: "Product",
 *       id: "product",
 *       links: [{ href: "/pricing", label: "Pricing" }],
 *     },
 *   ]}
 *   navLabel="Footer"
 *   otherSite="other site"
 *   tagline="Tools for builders."
 * />
 */
const SiteFooter = /* @__PURE__ */ named(
  "SiteFooter",
  ({
    bottom,
    brand,
    columns,
    navLabel,
    otherSite,
    tagline,
  }: SiteFooterProps): React.ReactElement => {
    // `material` is not read: both values draw the flat footer, and the
    // attribute keeps the whole subtree solid.
    return (
      <footer
        className={cn(PAGE_COLUMN, "pb-6 pt-8")}
        data-material="solid"
        data-slot="site-footer"
      >
        <Separator />
        <div className="mt-6 flex flex-col gap-6 min-[1200px]:flex-row min-[1200px]:gap-8">
          <div className="flex flex-col gap-2 min-[1200px]:w-[131px] min-[1200px]:shrink-0">
            <p className="m-0 text-xl font-semibold">{brand}</p>
            <p className="m-0 text-sm text-muted-foreground">{tagline}</p>
          </div>
          <nav aria-label={navLabel} className={columnsGrid(columns.length)}>
            {columns.map((column) => (
              <div className="flex flex-col gap-2" key={column.id}>
                <h2
                  className="m-0 text-xs font-medium"
                  id={`footer-${column.id}`}
                >
                  {column.heading}
                </h2>
                <ul
                  aria-labelledby={`footer-${column.id}`}
                  className="m-0 flex list-none flex-col p-0 min-[1200px]:gap-2"
                >
                  {column.links.map((link) => (
                    <li key={`${link.href}|${link.label}`}>
                      <FooterLinkItem link={link} otherSite={otherSite} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        {bottom ? (
          <div className="mt-6 text-xs text-muted-foreground">{bottom}</div>
        ) : null}
      </footer>
    );
  },
);

export { SiteFooter };
