export type SharePlatform =
  | "bluesky"
  | "facebook"
  | "linkedin"
  | "mastodon"
  | "threads"
  | "x";

export type PlatformConfig = {
  key: SharePlatform;
  label: string;
};

const defaultPlatforms: PlatformConfig[] = [
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "mastodon", label: "Mastodon" },
  { key: "bluesky", label: "Bluesky" },
  { key: "threads", label: "Threads" },
];

function buildShareUrl(
  platform: SharePlatform,
  url: string,
  title: string,
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "mastodon":
      return `https://mastodon.social/share?text=${encodedTitle}%20${encodedUrl}`;
    case "bluesky":
      return `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`;
  }
}

type ShareSectionProps = {
  buildUrl?: (platform: SharePlatform, url: string, title: string) => string;
  platforms?: PlatformConfig[];
  shareOn: string;
  shareTitle: string;
  title: string;
  url: string;
};

export function ShareSection({
  buildUrl: buildUrlFunction = buildShareUrl,
  platforms = defaultPlatforms,
  shareOn,
  shareTitle,
  title,
  url,
}: ShareSectionProps) {
  return (
    <div className="border-t border-border pt-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">{shareTitle}</h3>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => (
          <a
            className="text-sm text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 hover:bg-accent rounded-md"
            href={buildUrlFunction(platform.key, url, title)}
            key={platform.key}
            rel="noopener noreferrer"
            target="_blank"
          >
            {shareOn} {platform.label}
          </a>
        ))}
      </div>
    </div>
  );
}
