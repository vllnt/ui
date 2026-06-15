import { NextResponse } from "next/server";

import { decodeTheme, themeToRegistryItem } from "@/lib/theme-serialize";

export const dynamic = "force-dynamic";

const JSON_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
]);

const NAME_PATTERN = /^[\da-z-]{1,40}$/i;

/** A well-formed token is ~700 chars; cap input before decoding. */
const MAX_TOKEN_LENGTH = 2048;

/**
 * Returns a shadcn `registry:theme` item decoded from the `?t=` token so a theme
 * built in the editor installs with `npx shadcn add <origin>/r/themes?t=...`.
 * Must stay dynamic — every distinct token yields a distinct response.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function GET(request: Request): Response {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  if (!token) {
    return NextResponse.json(
      { error: "Missing theme token. Expected ?t=<encoded>." },
      { status: 400 },
    );
  }
  if (token.length > MAX_TOKEN_LENGTH) {
    return NextResponse.json(
      { error: "Theme token too long." },
      { status: 400 },
    );
  }

  const theme = decodeTheme(token);
  if (!theme) {
    return NextResponse.json(
      { error: "Invalid or malformed theme token." },
      { status: 400 },
    );
  }

  const requestedName = url.searchParams.get("name");
  const name =
    requestedName && NAME_PATTERN.test(requestedName)
      ? requestedName
      : undefined;

  return NextResponse.json(themeToRegistryItem(theme, name), {
    headers: JSON_HEADERS,
  });
}
