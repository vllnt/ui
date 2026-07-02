"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMounted } from "@vllnt/ui";
import { cn } from "@vllnt/ui";
import { useSidebar } from "@vllnt/ui";

export type SidebarItem = {
  href: string;
  title: string;
};

export type SidebarSection = {
  collapsible?: boolean;
  defaultOpen?: boolean;
  family?: boolean;
  href?: string;
  items: SidebarItem[];
  title?: string;
};

type SidebarProps = {
  sections: SidebarSection[];
};

const getMobileSnapshot = () =>
  typeof window === "undefined" ? false : window.innerWidth < 1024;

const getServerMobileSnapshot = () => false;

const subscribeToViewportResize = (onStoreChange: () => void) => {
  window.addEventListener("resize", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
  };
};

function useMobile(setOpen: (open: boolean) => void) {
  const isMobile = useSyncExternalStore(
    subscribeToViewportResize,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile, setOpen]);

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
    container.addEventListener("scroll", checkScroll, { passive: true });
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
            "size-3 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        hidden={!isOpen}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </>
  );
}

type FamilyNavProps = {
  isMobile: boolean;
  onNavigate: () => void;
  pathname: string;
  sections: SidebarSection[];
};

const FAMILY_ROW_CLASS =
  "flex w-full items-center justify-between px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

function FamilyRowLabel({ section }: { section: SidebarSection }) {
  return (
    <>
      <span>{section.title}</span>
      <span className="flex items-center gap-1 text-xs">
        {section.items.length}
        <ChevronRight className="size-3" />
      </span>
    </>
  );
}

function FamilyList({
  isMobile,
  onNavigate,
  onOpen,
  sections,
}: {
  isMobile: boolean;
  onNavigate: () => void;
  onOpen: (title: string) => void;
  sections: SidebarSection[];
}) {
  return (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Components
      </div>
      <div className="space-y-0.5">
        {sections.map((section) =>
          section.href ? (
            <Link
              className={FAMILY_ROW_CLASS}
              href={section.href}
              key={section.title}
              onClick={() => {
                if (isMobile) {
                  onNavigate();
                }
              }}
            >
              <FamilyRowLabel section={section} />
            </Link>
          ) : (
            <button
              className={FAMILY_ROW_CLASS}
              key={section.title}
              onClick={() => {
                onOpen(section.title ?? "");
              }}
              type="button"
            >
              <FamilyRowLabel section={section} />
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function FamilyItems({
  isMobile,
  onBack,
  onNavigate,
  pathname,
  section,
}: {
  isMobile: boolean;
  onBack: () => void;
  onNavigate: () => void;
  pathname: string;
  section: SidebarSection;
}) {
  return (
    <div className="space-y-1">
      <button
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        onClick={onBack}
        type="button"
      >
        <ChevronLeft className="size-3" />
        <span>All families</span>
      </button>
      <div className="flex items-center justify-between px-3 pb-1">
        {section.href ? (
          <Link
            className="text-sm font-semibold hover:underline"
            href={section.href}
            onClick={() => {
              if (isMobile) {
                onNavigate();
              }
            }}
          >
            {section.title}
          </Link>
        ) : (
          <span className="text-sm font-semibold">{section.title}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {section.items.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <Link
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            href={item.href}
            key={item.href}
            onClick={() => {
              if (isMobile) {
                onNavigate();
              }
            }}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Single-pane drill-down for grouped component families: the family list (ROOT)
 * or one family's items (FAMILY), so a long flat list never renders at once.
 * Auto-drills into the family that contains the active route, re-syncing on
 * navigation while still allowing manual drill / back between routes.
 *
 * @param sections - family-tagged sidebar sections (each `title` is a family)
 * @param pathname - current route, used to detect + auto-open the active family
 */
function FamilyNav({
  isMobile,
  onNavigate,
  pathname,
  sections,
}: FamilyNavProps) {
  const activeTitle =
    sections.find(
      (section) =>
        section.href === pathname ||
        section.items.some((item) => item.href === pathname),
    )?.title ?? null;

  const [routeKey, setRouteKey] = useState(pathname);
  const [openTitle, setOpenTitle] = useState<null | string>(activeTitle);

  if (routeKey !== pathname) {
    setRouteKey(pathname);
    setOpenTitle(activeTitle);
  }

  const openSection =
    openTitle === null
      ? null
      : (sections.find((section) => section.title === openTitle) ?? null);

  if (openSection) {
    return (
      <FamilyItems
        isMobile={isMobile}
        onBack={() => {
          setOpenTitle(null);
        }}
        onNavigate={onNavigate}
        pathname={pathname}
        section={openSection}
      />
    );
  }

  return (
    <FamilyList
      isMobile={isMobile}
      onNavigate={onNavigate}
      onOpen={(title) => {
        setOpenTitle(title);
      }}
      sections={sections}
    />
  );
}

// eslint-disable-next-line max-lines-per-function
export function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const isMobile = useMobile(setOpen);
  const mounted = useMounted();
  const scrollContainerReference = useRef<HTMLDivElement>(null);
  const { showBottomFade, showTopFade } = useScrollFade(
    scrollContainerReference,
  );

  const collapsed = mounted && !isMobile && !open;

  const familySections = sections.filter((section) => section.family);
  const otherSections = sections.filter((section) => !section.family);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open ? (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          data-testid="sidebar-overlay"
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
          "fixed lg:relative top-16 lg:top-0 bottom-0 lg:bottom-auto left-0 z-40 lg:h-full bg-background transition-[transform,width] duration-300 ease-in-out",
          "flex flex-col",
          "overflow-hidden",
          "shrink-0",
          collapsed ? "border-r-0" : "border-r",
          collapsed ? "w-0" : isMobile ? "w-full" : "w-64",
          isMobile && open && "translate-x-0",
          isMobile && !open && "-translate-x-full",
          !isMobile && !collapsed && "-translate-x-full lg:translate-x-0",
          !isMobile && collapsed && "-translate-x-full",
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
            className="flex-1 p-4 overflow-y-auto overscroll-contain h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={scrollContainerReference}
          >
            <div className="space-y-4">
              {otherSections.map((section, sectionIndex) => {
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
              {familySections.length > 0 ? (
                <FamilyNav
                  isMobile={isMobile}
                  onNavigate={() => {
                    setOpen(false);
                  }}
                  pathname={pathname}
                  sections={familySections}
                />
              ) : null}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
