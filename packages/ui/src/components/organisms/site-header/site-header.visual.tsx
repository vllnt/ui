import { expect, type Page, test } from "@playwright/experimental-ct-react";

import { SiteHeader, type SiteHeaderProps } from "./site-header";

const props: SiteHeaderProps = {
  cta: { href: "/packages", label: "Browse packages" },
  currentHref: "/packages",
  homeHref: "/",
  items: [
    { bar: "tablet", href: "/packages", label: "Packages" },
    { bar: "desktop", href: "/convex", label: "Convex" },
    { bar: "tablet", href: "/contribute", label: "Contribute" },
    {
      bar: "desktop",
      external: true,
      href: "https://github.com/vllnt",
      label: "GitHub",
    },
  ],
  labels: {
    close: "Close menu",
    external: "opens in a new tab",
    home: "vllnt, home",
    menu: "Menu",
    open: "Open menu",
    primary: "Main",
  },
  network: {
    groups: [
      {
        id: "parent",
        items: [{ current: false, href: "#vllnt", label: "vllnt" }],
      },
      {
        heading: "Learn and build",
        id: "learn-build",
        items: [
          { current: true, href: "#oss", label: "Open Source" },
          { current: false, href: "#ui", label: "ui" },
        ],
      },
    ],
    label: "vllnt network",
  },
};

function collectProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  return problems;
}

/** The smallest side of every visible link and button. */
async function smallestTarget(page: Page): Promise<number> {
  return page.evaluate(() => {
    const sizes = [...document.querySelectorAll("a, button")]
      .filter((element) => element.checkVisibility())
      .map((element) => {
        const box = element.getBoundingClientRect();
        return Math.min(box.width, box.height);
      });
    return Math.min(...sizes);
  });
}

test.describe("SiteHeader on a phone", () => {
  test.use({ hasTouch: true, viewport: { height: 800, width: 375 } });

  test("opens the menu, reaches every link and the network, and closes with Escape", async ({
    mount,
    page,
  }) => {
    const problems = collectProblems(page);
    await mount(<SiteHeader {...props} />);

    const button = page.getByRole("button", { name: "Open menu" });
    await button.click();
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Packages" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      menu.getByRole("group", { name: "vllnt network" }),
    ).toBeVisible();
    await expect(
      menu.getByRole("link", { name: "Browse packages" }),
    ).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(menu.locator(":focus")).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toBeFocused();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows).toBe(false);
    expect(problems).toEqual([]);
  });

  test("gives every visible control a 44 px touch target", async ({
    mount,
    page,
  }) => {
    await mount(<SiteHeader {...props} />);
    await page.getByRole("button", { name: "Open menu" }).click();

    expect(await smallestTarget(page)).toBeGreaterThanOrEqual(44);
  });
});

test.describe("SiteHeader on a tablet", () => {
  test.use({ viewport: { height: 900, width: 1024 } });

  test("opens the network switcher from the keyboard and hands focus back on Escape", async ({
    mount,
    page,
  }) => {
    const problems = collectProblems(page);
    await mount(<SiteHeader {...props} />);

    const trigger = page.getByRole("button", { name: "vllnt network" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = page.getByRole("navigation", { name: "vllnt network" });
    await expect(panel.getByRole("link", { name: "ui" })).toBeVisible();
    await expect(panel.getByText("Open Source")).toHaveAttribute(
      "aria-current",
      "true",
    );

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(problems).toEqual([]);
  });

  test("shows the tablet links in the bar and the desktop links in the menu", async ({
    mount,
    page,
  }) => {
    await mount(<SiteHeader {...props} />);

    const bar = page.getByRole("navigation", { name: "Main" });
    await expect(bar.getByRole("link", { name: "Packages" })).toBeVisible();
    await expect(bar.getByRole("link", { name: "Convex" })).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu.getByRole("link", { name: "Convex" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Packages" })).toHaveCount(0);
  });
});

test.describe("SiteHeader on a desktop", () => {
  test.use({ viewport: { height: 900, width: 1440 } });

  test("shows every bar link, no menu button, and 24 px or larger targets", async ({
    mount,
    page,
  }) => {
    await mount(<SiteHeader {...props} />);

    const bar = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Packages", "Convex", "Contribute"]) {
      await expect(bar.getByRole("link", { name })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    expect(await smallestTarget(page)).toBeGreaterThanOrEqual(24);

    const header = await page.getByRole("banner").boundingBox();
    expect(Math.round(header?.height ?? 0)).toBe(53);
  });

  test("draws a focus ring on keyboard focus", async ({ mount, page }) => {
    await mount(<SiteHeader {...props} />);

    await page.keyboard.press("Tab");
    const shadow = await page.evaluate(
      () => getComputedStyle(document.activeElement ?? document.body).boxShadow,
    );
    expect(shadow).not.toBe("none");
  });
});
