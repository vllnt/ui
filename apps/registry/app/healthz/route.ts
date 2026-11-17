export const dynamic = "force-dynamic";

/**
 * Liveness probe for the container health check. It answers from the Node
 * process without rendering a page, reading content or passing through the
 * locale middleware, so it stays cheap while page renders compete for the CPU.
 *
 * @returns A plain `ok` that no cache stores.
 */
export function GET(): Response {
  return new Response("ok", {
    headers: [
      ["Cache-Control", "no-store"],
      ["Content-Type", "text/plain; charset=utf-8"],
    ],
  });
}
