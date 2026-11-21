import Link from "next/link";

import { Badge } from "../../atoms/badge/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../atoms/card/card";

type ContentCardPost = {
  date?: string;
  description: string;
  slug: string;
  tags?: string[];
  title: string;
  updatedDate?: string;
};

type ContentCardProps = {
  formatDate?: (date: string, lang: string) => string;
  getDictValue?: (dict: Record<string, unknown>, path: string) => string;
  href: string;
  lang?: string;
  post: ContentCardPost;
  readMoreLabel?: string;
  showBadge?: boolean;
  showDate?: boolean;
  showReadMore?: boolean;
  updatedLabel?: string;
};

type ContentCardMetaProps = Pick<
  ContentCardProps,
  "formatDate" | "lang" | "post" | "showBadge" | "showDate" | "updatedLabel"
>;

function formatPostDate(
  { formatDate, lang, showDate }: Omit<ContentCardMetaProps, "post">,
  value?: string,
): string | undefined {
  return showDate && value && formatDate && lang
    ? formatDate(value, lang)
    : undefined;
}

function ContentCardMeta({
  post,
  showBadge,
  updatedLabel,
  ...dateOptions
}: ContentCardMetaProps) {
  const badgeLabel = showBadge ? post.tags?.[0] : undefined;
  const date = formatPostDate(dateOptions, post.date);
  const updatedDate = formatPostDate(dateOptions, post.updatedDate);

  if (
    badgeLabel === undefined &&
    date === undefined &&
    updatedDate === undefined
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      {badgeLabel === undefined ? null : (
        <Badge className="text-xs" variant="secondary">
          {badgeLabel}
        </Badge>
      )}
      {date === undefined ? null : (
        <span className="text-xs text-muted-foreground">{date}</span>
      )}
      {updatedDate === undefined ? null : (
        <span className="text-xs text-muted-foreground">
          {updatedLabel ? `${updatedLabel} ` : ""}
          {updatedDate}
        </span>
      )}
    </div>
  );
}

export function ContentCard({
  formatDate,
  href,
  lang,
  post,
  readMoreLabel,
  showBadge = true,
  showDate = true,
  showReadMore = true,
  updatedLabel,
}: ContentCardProps) {
  return (
    <Link className="block h-full" href={href}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <ContentCardMeta
            formatDate={formatDate}
            lang={lang}
            post={post}
            showBadge={showBadge}
            showDate={showDate}
            updatedLabel={updatedLabel}
          />
          <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {post.description}
          </CardDescription>
        </CardHeader>
        {showReadMore && readMoreLabel ? (
          <CardContent className="mt-auto">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              {readMoreLabel} <span className="text-sm">→</span>
            </span>
          </CardContent>
        ) : null}
      </Card>
    </Link>
  );
}

export function BlogCard(props: ContentCardProps) {
  return <ContentCard {...props} />;
}
