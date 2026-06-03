import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../profile-section", () => ({
  ProfileSection: ({
    dict,
  }: {
    dict: { profile: { name: string; tagline: string } };
  }) => (
    <section aria-label="profile">
      <h3>{dict.profile.name}</h3>
      <p>{dict.profile.tagline}</p>
    </section>
  ),
}));

vi.mock("../share-section", () => ({
  ShareSection: ({
    shareTitle,
    title,
    url,
  }: {
    shareTitle: string;
    title: string;
    url: string;
  }) => (
    <section aria-label="share">
      {shareTitle}: {title} ({url})
    </section>
  ),
}));

import {
  TutorialComplete,
  type TutorialCompleteProps,
} from "./tutorial-complete";

const labels = {
  backToTutorials: "Back to Tutorials",
  profileName: "Jane Doe",
  profileTagline: "React Developer",
  relatedContent: "Continue Learning",
  reviewSections: "Review Sections",
  shareOn: "Share on",
  shareTitle: "Share this tutorial",
  startOver: "Start Over",
  tutorialComplete: "Tutorial Complete!",
  tutorialFinished: "Tutorial Finished",
  youveCompletedAll: "You've completed all sections of",
  youveFinishedWith: "You've finished with",
};

const sections = [
  { id: "intro", title: "Introduction" },
  { id: "advanced", title: "Advanced Concepts" },
];

function TestLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

function renderTutorialComplete(props: Partial<TutorialCompleteProps> = {}) {
  const onGoToSection = vi.fn();
  const onRestart = vi.fn();
  render(
    <TutorialComplete
      backHref="/tutorials"
      completedSections={new Set(["intro", "advanced"])}
      completionPercent={100}
      labels={labels}
      linkComponent={TestLink}
      onGoToSection={onGoToSection}
      onRestart={onRestart}
      relatedContent={[
        { href: "/next", title: "Next Tutorial", type: "Tutorial" },
      ]}
      sections={sections}
      shareUrl="https://example.com/tutorial"
      title="React Basics"
      {...props}
    />,
  );

  return { onGoToSection, onRestart };
}

describe("TutorialComplete", () => {
  it("renders the full completion state and restarts", () => {
    const { onRestart } = renderTutorialComplete();

    expect(
      screen.getByRole("heading", { name: "Tutorial Complete!" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('You\'ve completed all sections of "React Basics"'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Over" }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("renders partial completion copy", () => {
    renderTutorialComplete({
      completedSections: new Set(["intro"]),
      completionPercent: 50,
    });

    expect(
      screen.getByRole("heading", { name: "Tutorial Finished" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('You\'ve finished with "React Basics" (50%)'),
    ).toBeInTheDocument();
  });

  it("navigates to review sections by index", () => {
    const { onGoToSection } = renderTutorialComplete();

    fireEvent.click(screen.getByRole("button", { name: /advanced concepts/i }));

    expect(onGoToSection).toHaveBeenCalledWith(1);
  });

  it("renders related links, share content, profile, and back link", () => {
    renderTutorialComplete({
      profile: {
        imageSource: "/profile.png",
        socialLinks: [{ href: "https://example.com", label: "Website" }],
      },
    });

    expect(
      screen.getByRole("link", { name: /tutorial next tutorial/i }),
    ).toHaveAttribute("href", "/next");
    expect(screen.getByLabelText("share")).toHaveTextContent(
      "Share this tutorial: React Basics (https://example.com/tutorial)",
    );
    expect(screen.getByLabelText("profile")).toHaveTextContent("Jane Doe");
    expect(
      screen.getByRole("link", { name: "← Back to Tutorials" }),
    ).toHaveAttribute("href", "/tutorials");
  });
});
