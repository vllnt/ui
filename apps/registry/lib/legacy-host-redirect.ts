export const LEGACY_HOST = "ui.vllnt.ai";
export const CANONICAL_HOST = "ui.vllnt.com";

export function legacyHostRedirectUrl(
  host: string | undefined,
  pathname: string,
  search: string,
): string | undefined {
  const hostname = (host ?? "").toLowerCase().split(":")[0];
  if (hostname !== LEGACY_HOST) {
    return undefined;
  }

  return `https://${CANONICAL_HOST}${pathname}${search}`;
}
