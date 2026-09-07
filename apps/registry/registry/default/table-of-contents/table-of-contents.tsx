"use client";

import { useEffect, useState } from "react";

import type { HeadingTag } from "@vllnt/ui";
import { cn } from "@vllnt/ui";

type TableOfContentsProps = {
  /** Heading tag for the "On This Page" label. Defaults to `h3`. */
  as?: HeadingTag;
  /** Heading label. Override to translate it. Defaults to `On This Page`. */
  label?: string;
  sections: { id: string; title: string }[];
};

function handleClick(id: string) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function useActiveSection(sections: { id: string; title: string }[]) {
  const [activeSection, setActiveSection] = useState<null | string>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -66% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => {
      const element = document.querySelector(`#${section.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  return activeSection;
}

export function TableOfContents({
  as: Heading = "h3",
  label = "On This Page",
  sections,
}: TableOfContentsProps) {
  const activeSection = useActiveSection(sections);

  if (sections.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-8">
        <div className="border-l-2 border-border pl-4">
          <Heading className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            {label}
          </Heading>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                className={cn(
                  "block text-left text-sm transition-colors",
                  "hover:text-foreground",
                  activeSection === section.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                )}
                key={section.id}
                onClick={() => {
                  handleClick(section.id);
                }}
                type="button"
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
