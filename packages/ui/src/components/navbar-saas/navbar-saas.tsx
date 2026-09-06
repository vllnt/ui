"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button/button";
import { useSidebar } from "../sidebar-provider/sidebar-provider";
import { ThemeToggle } from "../theme-toggle/theme-toggle";

export type NavItem = {
  href: string;
  title: string;
};

export type NavbarSaasProps = {
  brand?: ReactNode;
  closeSidebarLabel?: string;
  navItems?: NavItem[];
  openSidebarLabel?: string;
  rightSlot?: ReactNode;
  showMobileMenu?: boolean;
  sidebarId?: string;
};

const EMPTY_NAV_ITEMS: NavItem[] = [];

function getHrefPathname(href: string): string {
  return href.split(/[#?]/, 1)[0] ?? href;
}

export function NavbarSaas({
  brand,
  closeSidebarLabel = "Close sidebar",
  navItems = EMPTY_NAV_ITEMS,
  openSidebarLabel = "Open sidebar",
  rightSlot,
  showMobileMenu = true,
  sidebarId,
}: NavbarSaasProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0"
      data-slot="navbar-saas"
      style={{ WebkitBackdropFilter: "blur(8px)" }}
    >
      <div className="w-full">
        <div className="mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {showMobileMenu ? (
              <Button
                aria-controls={sidebarId}
                aria-expanded={open}
                aria-label={open ? closeSidebarLabel : openSidebarLabel}
                data-testid="navbar-saas-mobile-trigger"
                onClick={() => {
                  setOpen(!open);
                }}
                size="icon"
                variant="ghost"
              >
                {open ? (
                  <>
                    <X className="size-4 lg:hidden" />
                    <PanelLeftClose className="hidden size-4 lg:block" />
                  </>
                ) : (
                  <>
                    <Menu className="size-4 lg:hidden" />
                    <PanelLeftOpen className="hidden size-4 lg:block" />
                  </>
                )}
              </Button>
            ) : null}
            {brand ? (
              typeof brand === "string" ? (
                <Link className="text-xl font-bold truncate" href="/">
                  {brand}
                </Link>
              ) : (
                brand
              )
            ) : null}
            {navItems.length > 0 ? (
              <nav className="hidden lg:flex gap-6">
                {navItems.map((item) => (
                  <Link
                    aria-current={
                      pathname === getHrefPathname(item.href)
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground/80",
                      pathname === getHrefPathname(item.href)
                        ? "text-foreground"
                        : "text-foreground/60",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            {rightSlot}
            <ThemeToggle
              dict={{
                theme: {
                  dark: "Dark",
                  light: "Light",
                  system: "System",
                  toggle_theme: "Toggle theme",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
