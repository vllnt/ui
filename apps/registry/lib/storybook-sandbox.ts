/**
 * The iframe `sandbox` for an embedded Storybook story. Scripts must run, and
 * the story needs its own origin (module scripts, storage), so it gets
 * `allow-same-origin` when it comes from another origin than the page. A
 * same-origin frame that holds both tokens can remove its own sandbox, so that
 * case gets scripts alone. A story never needs popups, forms, modals or
 * top-level navigation, so the sandbox grants none of those.
 *
 * @param frameUrl - absolute URL of the story document
 * @param pageOrigin - origin of the page that embeds it
 * @returns The `sandbox` attribute value
 * @example
 * storybookSandbox("https://storybook.example/iframe.html", "https://docs.example");
 * // "allow-scripts allow-same-origin"
 */
export function storybookSandbox(frameUrl: string, pageOrigin: string): string {
  return new URL(frameUrl).origin === pageOrigin
    ? "allow-scripts"
    : "allow-scripts allow-same-origin";
}
