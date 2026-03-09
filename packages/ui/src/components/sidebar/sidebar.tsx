"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";
import { useSidebar } from "../sidebar-provider";

export type SidebarItem = {
  href: string;
  title: string;
};

export type SidebarSection = {
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: SidebarItem[];
  title?: string;
};

type SidebarProps = {
  sections: SidebarSection[];
};

function useMobile(setOpen: (open: boolean) => void) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [setOpen]);

  return isMobile;
}

function useScrollFade(
  containerReference: React.RefObject<HTMLDivElement | null>,
) {
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  useEffect(() => {
    const container = containerReference.current;
    if (!container) return;

    const checkScroll = () => {
      const { clientHeight, scrollHeight, scrollTop } = container;
      setShowTopFade(scrollTop > 0);
      setShowBottomFade(scrollTop < scrollHeight - clientHeight - 1);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    return () => {
      container.removeEventListener("scroll", checkScroll);
    };
  }, [containerReference]);

  return { showBottomFade, showTopFade };
}

type CollapsibleSectionProps = {
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  title: string;
};

function CollapsibleSection({
  children,
  collapsible = false,
  defaultOpen = true,
  title,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <>
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        {children}
      </>
    );
  }

  return (
    <>
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </>
  );
}

// eslint-disable-next-line max-lines-per-function
export function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const isMobile = useMobile(setOpen);
  const scrollContainerReference = useRef<HTMLDivElement>(null);
  const { showBottomFade, showTopFade } = useScrollFade(
    scrollContainerReference,
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open ? (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {
            setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative top-16 lg:top-0 bottom-0 lg:bottom-auto left-0 z-40 lg:h-full border-r bg-background transition-transform duration-300 ease-in-out",
          "flex flex-col",
          "overflow-hidden",
          "shrink-0",
          isMobile ? "w-full" : "w-64",
          isMobile && !open && "-translate-x-full",
          isMobile && open && "translate-x-0",
          !isMobile && !open && "-translate-x-full lg:translate-x-0",
          !isMobile && "lg:translate-x-0",
        )}
      >
        <div className="relative flex-1 overflow-hidden">
          {/* Top fade */}
          {showTopFade ? (
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          ) : null}

          {/* Bottom fade */}
          {showBottomFade ? (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          ) : null}

          <nav
            className="flex-1 p-4 overflow-y-auto h-full"
            ref={scrollContainerReference}
          >
            <div className="space-y-4">
              {sections.map((section, sectionIndex) => {
                const sectionItems = (
                  <div className={section.title ? "space-y-0.5" : "space-y-1"}>
                    {section.items.map((item) => (
                      <Link
                        className={cn(
                          section.title
                            ? "block px-3 py-1.5 rounded-md text-sm transition-colors"
                            : "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          pathname === item.href ||
                            (item.href === "/" && pathname === "/")
                            ? "bg-accent text-accent-foreground"
                            : section.title
                              ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground",
                          section.title &&
                            pathname === item.href &&
                            "font-medium",
                        )}
                        href={item.href}
                        key={item.href}
                        onClick={() => {
                          if (isMobile) {
                            setOpen(false);
                          }
                        }}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                );

                return (
                  <div
                    className="space-y-1"
                    key={section.title || sectionIndex}
                  >
                    {section.title ? (
                      <CollapsibleSection
                        collapsible={section.collapsible}
                        defaultOpen={section.defaultOpen ?? true}
                        title={section.title}
                      >
                        {sectionItems}
                      </CollapsibleSection>
                    ) : (
                      sectionItems
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
