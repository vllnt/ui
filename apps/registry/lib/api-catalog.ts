import { registry } from "@/lib/registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

/** Link relation RFC 8631 defines for the documentation of a service. */
const SERVICE_DOC = "service-doc";

type CatalogLink = {
  readonly href: string;
  readonly title?: string;
  readonly type?: string;
};

type CatalogEntry = {
  readonly anchor: string;
  readonly item?: readonly CatalogLink[];
  readonly [SERVICE_DOC]?: readonly CatalogLink[];
};

/** A linkset document (RFC 9264) in the shape RFC 9727 expects at `/.well-known/api-catalog`. */
export type ApiCatalog = {
  readonly linkset: readonly CatalogEntry[];
};

/** Media type RFC 9727 requires for the catalog. */
export const API_CATALOG_CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

const LLMS_LINK: CatalogLink = {
  href: `${SITE_URL}/llms.txt`,
  title: "llms.txt",
  type: "text/plain",
};

function docsPage(path: string, title: string): CatalogLink {
  return { href: `${SITE_URL}${path}`, title, type: "text/html" };
}

/**
 * The machine-readable APIs the site serves: the shadcn registry (an index and
 * one JSON document per component) and the MCP endpoint. Documentation links
 * point at the llms.txt summary and the pages that explain each API.
 *
 * @returns The catalog as a linkset
 * @example
 * buildApiCatalog().linkset[0]?.anchor; // "https://ui.vllnt.com/r/registry.json"
 */
export function buildApiCatalog(): ApiCatalog {
  return {
    linkset: [
      {
        anchor: `${SITE_URL}/r/registry.json`,
        item: registry.items.map((component) => ({
          href: `${SITE_URL}/r/${component.name}.json`,
          title: component.title,
          type: "application/json",
        })),
        [SERVICE_DOC]: [
          docsPage("/docs/registry", "Registry documentation"),
          LLMS_LINK,
        ],
      },
      {
        anchor: `${SITE_URL}/mcp`,
        [SERVICE_DOC]: [
          docsPage("/docs/agents", "Agents and MCP documentation"),
          LLMS_LINK,
        ],
      },
    ],
  };
}
