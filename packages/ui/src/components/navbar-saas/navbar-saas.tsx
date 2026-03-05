"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { useSidebar } from "../sidebar-provider";
import { ThemeToggle } from "../theme-toggle";

import { useMobile } from "./use-mobile";

export type NavItem = {
  href: string;
  title: string;
};

export type NavbarSaasProps = {
  brand?: ReactNode;
  navItems?: NavItem[];
  rightSlot?: ReactNode;
  showMobileMenu?: boolean;
};

export function NavbarSaas({
  brand,
  navItems = [],
  rightSlot,
  showMobileMenu = true,
}: NavbarSaasProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const isMobile = useMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="w-full">
        <div className="mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {showMobileMenu && isMobile ? (
              <Button
                className="lg:hidden"
                onClick={() => {
                  setOpen(!open);
                }}
                size="icon"
                variant="ghost"
              >
                {open ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
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
              <nav className="hidden md:flex gap-6">
                {navItems.map((item) => (
                  <Link
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground/80",
                      pathname === item.href
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
