"use client";

import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";

type TableOfContentsProps = {
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
      sections.forEach((section) => {
        const element = document.querySelector(`#${section.id}`);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sections]);

  return activeSection;
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const activeSection = useActiveSection(sections);

  if (sections.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-8">
        <div className="border-l-2 border-border pl-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            On This Page
          </h3>
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
