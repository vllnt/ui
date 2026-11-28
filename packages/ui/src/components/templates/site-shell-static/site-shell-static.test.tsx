import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";
import { SiteFooter } from "../../molecules/site-footer/site-footer";
import { SiteHeaderStatic } from "../../organisms/site-header-static/site-header-static";

import { SiteShellStatic } from "./site-shell-static";

function renderShell(mainClassName?: string) {
  return render(
    <SiteShellStatic
      footer={
        <SiteFooter
          brand="Acme"
          columns={[
            {
              heading: "Product",
              id: "product",
              links: [{ href: "/pricing", label: "Pricing" }],
            },
          ]}
          navLabel="Footer"
          otherSite="other site"
          tagline="Tools for builders."
        />
      }
      header={
        <SiteHeaderStatic
          brand="Acme"
          homeHref="/"
          items={[{ bar: "tablet", href: "/docs", label: "Docs" }]}
          labels={{
            home: "Acme home",
            menu: "Menu",
            open: "Open menu",
            primary: "Primary",
          }}
        />
      }
      {...(mainClassName === undefined ? {} : { mainClassName })}
      skipLabel="Skip to content"
    >
      <p>Page text</p>
    </SiteShellStatic>,
  );
}

beforeEach(() => {
  stubMatchMedia(false);
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
});

describe("SiteShellStatic", () => {
  it("has one skip link first, one main#main and a footer outside it", () => {
    const { container } = renderShell();
    const skips = container.querySelectorAll('a[href="#main"]');
    expect(skips).toHaveLength(1);
    expect(container.querySelector("a, button")).toBe(skips[0]);
    expect(container.querySelectorAll("main#main")).toHaveLength(1);
    expect(screen.getByRole("main")).not.toContainElement(
      screen.getByRole("contentinfo"),
    );
  });

  it("renders the static header and the footer column titles as h2", () => {
    renderShell();
    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Acme home",
      }),
    ).toHaveAttribute("href", "/");
    expect(
      within(screen.getByRole("contentinfo")).getByRole("heading", {
        level: 2,
      }),
    ).toHaveTextContent("Product");
  });

  it("has no theme control: a setting needs script", () => {
    renderShell();
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });

  it("leaves color-scheme to the app stylesheet", () => {
    renderShell();
    expect(document.documentElement.style.colorScheme).toBe("");
  });

  it("passes mainClassName to the main element", () => {
    renderShell("flex-1");
    expect(screen.getByRole("main")).toHaveClass("flex-1");
  });

  it("never imports the theme control, so a page ships none of its code", () => {
    const source = readFileSync(
      join(__dirname, "site-shell-static.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/theme-bar/);
    expect(source).not.toMatch(/["']use client["']/);
  });
});
