import Link from "next/link";

import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

type ContentCardPost = {
  date?: string;
  description: string;
  slug: string;
  tags?: string[];
  title: string;
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
};

export function ContentCard({
  formatDate,
  href,
  lang,
  post,
  readMoreLabel,
  showBadge = true,
  showDate = true,
  showReadMore = true,
}: ContentCardProps) {
  const shouldShowBadge = showBadge && post.tags && post.tags.length > 0;
  const shouldShowDate = showDate && post.date && formatDate && lang;
  const shouldShowHeaderMeta = shouldShowBadge || shouldShowDate;

  return (
    <Link className="block h-full" href={href}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          {shouldShowHeaderMeta ? (
            <div className="flex items-center gap-2 mb-2">
              {shouldShowBadge ? (
                <Badge className="text-xs" variant="secondary">
                  {post.tags?.[0]}
                </Badge>
              ) : null}
              {shouldShowDate && post.date && lang ? (
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.date, lang)}
                </span>
              ) : null}
            </div>
          ) : null}
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

// Keep BlogCard as an alias for backward compatibility
export const BlogCard = ContentCard;
