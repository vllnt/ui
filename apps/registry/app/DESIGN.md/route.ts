import { getDesignGuideMarkdown } from "@/lib/design-guide";

const MARKDOWN_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/markdown; charset=utf-8"],
]);

export const dynamic = "force-static";
export const revalidate = 86_400;

async function getDesignMarkdown(): Promise<Response> {
  const body = await getDesignGuideMarkdown();

  return new Response(body, { headers: MARKDOWN_HEADERS });
}

export { getDesignMarkdown as GET };
