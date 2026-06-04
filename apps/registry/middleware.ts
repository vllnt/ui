import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|mcp|r/|atom\\.xml|rss\\.xml|design\\.txt|llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.[^/]+$).*)",
  ],
};
