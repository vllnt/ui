import { API_CATALOG_CONTENT_TYPE, buildApiCatalog } from "@/lib/api-catalog";

const CATALOG_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", API_CATALOG_CONTENT_TYPE],
]);

export const dynamic = "force-static";
export const revalidate = 86_400;

function getApiCatalog(): Response {
  return new Response(JSON.stringify(buildApiCatalog()), {
    headers: CATALOG_HEADERS,
  });
}

export { getApiCatalog as GET };
