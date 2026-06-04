import { getDesignGuideMarkdown } from "@/lib/design-guide";

const TEXT_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/plain; charset=utf-8"],
]);

export const dynamic = "force-static";
export const revalidate = 86_400;

async function getDesignText(): Promise<Response> {
  const body = await getDesignGuideMarkdown();

  return new Response(body, { headers: TEXT_HEADERS });
}

export { getDesignText as GET };
