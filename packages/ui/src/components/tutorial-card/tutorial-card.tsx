"use client";

import { memo, useEffect, useState } from "react";

import type { ReactNode } from "react";

import { useMounted } from "../../lib/use-mounted";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

export type TutorialCardProgress = {
  completedCount: number;
  totalSections: number;
};

export type TutorialCardMeta = {
  description: string;
  difficulty: "advanced" | "beginner" | "intermediate";
  estimatedTime: string;
  id: string;
  sectionCount: number;
  tags: string[];
  title: string;
};

export type TutorialCardLabels = {
  completed: string;
  difficulty: Record<string, string>;
  sectionsCount: string;
};

export type TutorialCardProps = {
  /** Function to get progress (for localStorage etc) */
  getProgress?: (id: string) => null | TutorialCardProgress;
  href: string;
  labels: TutorialCardLabels;
  /** Link component (e.g., Next.js Link) */
  linkComponent?: React.ComponentType<{
    children: ReactNode;
    className?: string;
    href: string;
  }>;
  tutorial: TutorialCardMeta;
};

const DIFFICULTY_VARIANTS = {
  advanced: "destructive",
  beginner: "secondary",
  intermediate: "default",
} satisfies Record<
  TutorialCardMeta["difficulty"],
  "default" | "destructive" | "secondary"
>;

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

function TutorialCardImpl({
  getProgress,
  href,
  labels,
  linkComponent: LinkComponent = DefaultLink,
  tutorial,
}: TutorialCardProps): React.ReactNode {
  const [progress, setProgress] = useState<null | TutorialCardProgress>(null);
  const isHydrated = useMounted();

  useEffect(() => {
    if (getProgress) {
      const result = getProgress(tutorial.id);
      requestAnimationFrame(() => {
        setProgress(result);
      });
    }
  }, [getProgress, tutorial.id]);

  const difficultyVariant = DIFFICULTY_VARIANTS[tutorial.difficulty];
  // Cap completedCount at sectionCount to handle stale localStorage data
  const safeCompletedCount = progress
    ? Math.min(progress.completedCount, tutorial.sectionCount)
    : 0;
  const showProgress = isHydrated && safeCompletedCount > 0;

  return (
    <LinkComponent className="block h-full" href={href}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs capitalize" variant={difficultyVariant}>
              {labels.difficulty[tutorial.difficulty] || tutorial.difficulty}
            </Badge>
            {showProgress ? (
              <span className="text-xs text-muted-foreground">
                {safeCompletedCount}/{tutorial.sectionCount} {labels.completed}
              </span>
            ) : null}
          </div>

          <CardTitle className="line-clamp-2 text-lg">
            {tutorial.title}
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {tutorial.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-auto space-y-2">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{tutorial.estimatedTime}</span>
            <span>•</span>
            <span>
              {tutorial.sectionCount} {labels.sectionsCount}
            </span>
          </div>

          {tutorial.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tutorial.tags.map((tag) => (
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

export const TutorialCard = memo(TutorialCardImpl);
TutorialCard.displayName = "TutorialCard";
