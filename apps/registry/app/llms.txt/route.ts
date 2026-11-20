import { buildLlmsTxt } from "@/lib/llms";

const TEXT_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/plain; charset=utf-8"],
]);

export const dynamic = "force-static";
export const revalidate = 86_400;

async function getLlmsTxt(): Promise<Response> {
  return new Response(await buildLlmsTxt(), { headers: TEXT_HEADERS });
}

export { getLlmsTxt as GET };
