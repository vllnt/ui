"use client";

import { memo } from "react";

import { Check, ChevronRight, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../button";
import { ProfileSection } from "../profile-section";
import { ShareSection } from "../share-section";

export type TutorialCompleteSection = {
  id: string;
  title: string;
};

export type TutorialCompleteRelatedContent = {
  href: string;
  title: string;
  type: string;
};

export type TutorialCompleteLabels = {
  backToTutorials: string;
  profileName: string;
  profileTagline: string;
  relatedContent: string;
  reviewSections: string;
  shareOn: string;
  shareTitle: string;
  startOver: string;
  tutorialComplete: string;
  tutorialFinished: string;
  youveCompletedAll: string;
  youveFinishedWith: string;
};

export type TutorialCompleteProps = {
  backHref: string;
  completedSections: Set<string>;
  completionPercent: number;
  labels: TutorialCompleteLabels;
  /** Link component (e.g., Next.js Link) */
  linkComponent?: React.ComponentType<{
    children: ReactNode;
    className?: string;
    href: string;
  }>;
  onGoToSection: (index: number) => void;
  onRestart: () => void;
  /** Profile config */
  profile?: {
    imageSource: string;
    socialLinks: { href: string; label: string }[];
  };
  relatedContent: TutorialCompleteRelatedContent[];
  sections: TutorialCompleteSection[];
  shareUrl: string;
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

// eslint-disable-next-line max-lines-per-function -- Completion UI renders stats, achievements, and related content
function TutorialCompleteImpl({
  backHref,
  completedSections,
  completionPercent,
  labels,
  linkComponent: LinkComponent = DefaultLink,
  onGoToSection,
  onRestart,
  profile,
  relatedContent,
  sections,
  shareUrl,
  title,
}: TutorialCompleteProps): React.ReactNode {
  const isFullyComplete = completionPercent === 100;

  return (
    <div>
      {/* Completion Status */}
      <div className="text-center py-12">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isFullyComplete ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
          }`}
        >
          <Check
            className={`h-10 w-10 ${isFullyComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
          />
        </div>

        <h2 className="text-3xl font-bold mb-2">
          {isFullyComplete ? labels.tutorialComplete : labels.tutorialFinished}
        </h2>

        <p className="text-muted-foreground mb-6">
          {isFullyComplete
            ? `${labels.youveCompletedAll} "${title}"`
            : `${labels.youveFinishedWith} "${title}" (${completionPercent}%)`}
        </p>

        <Button className="gap-2" onClick={onRestart} variant="outline">
          <RotateCcw className="h-4 w-4" />
          {labels.startOver}
        </Button>
      </div>

      {/* Review Sections */}
      <div className="max-w-2xl mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-4">{labels.reviewSections}</h3>
        <div className="space-y-2">
          {sections.map((section, index) => {
            const isCompleted = completedSections.has(section.id);
            return (
              <button
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                key={`${section.id}-${index}`}
                onClick={() => {
                  onGoToSection(index);
                }}
                type="button"
              >
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isCompleted
                      ? "bg-foreground border-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 text-background" />
                  ) : null}
                </div>
                <span className="flex-1 truncate">{section.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Related Content */}
      {relatedContent.length > 0 ? (
        <div className="max-w-2xl mx-auto mt-12">
          <h3 className="text-lg font-semibold mb-4">
            {labels.relatedContent}
          </h3>
          <div className="space-y-2">
            {relatedContent.map((item) => (
              <LinkComponent
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                href={item.href}
                key={item.href}
              >
                <span className="text-xs uppercase text-muted-foreground font-medium">
                  {item.type}
                </span>
                <span className="flex-1 truncate">{item.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </LinkComponent>
            ))}
          </div>
        </div>
      ) : null}

      {/* Share Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <ShareSection
          shareOn={labels.shareOn}
          shareTitle={labels.shareTitle}
          title={title}
          url={shareUrl}
        />
      </div>

      {/* Profile Section */}
      {profile ? (
        <div className="border-t border-border pt-8 mt-12">
          <div className="max-w-4xl mx-auto">
            <ProfileSection
              dict={{
                profile: {
                  name: labels.profileName,
                  tagline: labels.profileTagline,
                },
              }}
              imageSource={profile.imageSource}
              socialLinks={profile.socialLinks}
            />
          </div>
        </div>
      ) : null}

      {/* Back Link */}
      <div className="text-center pt-8">
        <LinkComponent
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          href={backHref}
        >
          <span>← {labels.backToTutorials}</span>
        </LinkComponent>
      </div>
    </div>
  );
}

export const TutorialComplete = memo(TutorialCompleteImpl);
TutorialComplete.displayName = "TutorialComplete";
