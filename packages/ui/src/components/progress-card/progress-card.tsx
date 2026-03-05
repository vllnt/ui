"use client";

import { memo, useEffect, useState } from "react";

import type { ReactNode } from "react";

import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

export type ContentCardProgress = {
  completedCount: number;
  totalSections: number;
};

export type ContentCardProps = {
  /** Badge label for difficulty/category */
  badgeLabel: string;
  /** Badge variant */
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  /** Card description */
  description: string;
  /** Function to get progress from storage */
  getProgress?: () => ContentCardProgress | null;
  /** Href for the card link */
  href: string;
  /** Link component to use (e.g., Next.js Link) */
  linkComponent?: React.ComponentType<{
    children: ReactNode;
    className?: string;
    href: string;
  }>;
  /** Metadata items (e.g., "30 min", "10 sections") */
  metadata?: string[];
  /** Progress completed label (e.g., "completed") */
  progressLabel?: string;
  /** Tags to display */
  tags?: string[];
  /** Card title */
  title: string;
};

function DefaultLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}): React.ReactNode {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

function ContentCardImpl({
  badgeLabel,
  badgeVariant = "default",
  description,
  getProgress,
  href,
  linkComponent: LinkComponent = DefaultLink,
  metadata = [],
  progressLabel = "completed",
  tags = [],
  title,
}: ContentCardProps): React.ReactNode {
  const [progress, setProgress] = useState<ContentCardProgress | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load progress after hydration
  useEffect(() => {
    setIsHydrated(true);
    if (getProgress) {
      setProgress(getProgress());
    }
  }, [getProgress]);

  const showProgress = isHydrated && progress && progress.completedCount > 0;

  return (
    <LinkComponent className="block h-full" href={href}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          {/* Badge and progress */}
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs capitalize" variant={badgeVariant}>
              {badgeLabel}
            </Badge>
            {showProgress ? (
              <span className="text-xs text-muted-foreground">
                {progress.completedCount}/{progress.totalSections}{" "}
                {progressLabel}
              </span>
            ) : null}
          </div>

          <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-auto space-y-2">
          {/* Metadata */}
          {metadata.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {metadata.map((item, index) => (
                <span key={index}>
                  {index > 0 ? <span className="mr-2">•</span> : null}
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {/* Tags */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge className="text-xs" key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </LinkComponent>
  );
}

export const ContentCard = memo(ContentCardImpl);
ContentCard.displayName = "ContentCard";
