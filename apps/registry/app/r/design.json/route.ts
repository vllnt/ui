import { NextResponse } from "next/server";

import { designTokens } from "@/lib/design-guide";

const JSON_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
]);

export const dynamic = "force-static";
export const revalidate = 86_400;

function getDesignTokens(): Response {
  return NextResponse.json(designTokens, { headers: JSON_HEADERS });
}

export { getDesignTokens as GET };
