import { ExternalLink } from "lucide-react";

const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

type StorybookLinkProps = {
  readonly label: string;
  readonly storyId: string;
};

export function StorybookLink({ label, storyId }: StorybookLinkProps) {
  const storybookUrl = new URL("/", STORYBOOK_URL);
  storybookUrl.searchParams.set("path", `/story/${storyId}`);

  return (
    <a
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={storybookUrl.toString()}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink className="size-4" />
    </a>
  );
}
