/**
 * Browsers, feed readers and crawlers ask for `/favicon.ico` before they read
 * any markup. The brand mark is `app/icon.svg`, which Next serves at
 * `/icon.svg`, so this sends them there instead of keeping a second copy of it.
 * The redirect is relative so it holds behind any proxy host.
 */
export function GET(): Response {
  return new Response(undefined, {
    headers: new Headers([
      ["Cache-Control", "public, max-age=86400"],
      ["Location", "/icon.svg"],
    ]),
    status: 307,
  });
}
