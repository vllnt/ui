const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

export function canonical(pathname: string): string {
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (trimmed === "/") {
    return SITE_URL;
  }
  return `${SITE_URL}${trimmed.replace(/\/$/, "")}`;
}
