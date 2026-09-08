import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  card: ({ slug }: { slug: string }) => slug,
  empty: () => false,
  translate: (key: string) => key,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: () => Promise.resolve(mocks.translate),
  setRequestLocale: mocks.empty,
}));
vi.mock("@/i18n/routing", () => ({
  ...Object.fromEntries([["Link", "a"]]),
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));
vi.mock("@/components/component-card", () =>
  Object.fromEntries([["ComponentCard", mocks.card]]),
);
vi.mock("@/components/platform-selector", () =>
  Object.fromEntries([["PlatformSelector", mocks.empty]]),
);
vi.mock("@/components/platform-sidebar", () =>
  Object.fromEntries([["PlatformSidebar", mocks.empty]]),
);
vi.mock("@/lib/content", () => ({
  getPageContent: () =>
    Promise.resolve({
      frontmatter: { description: "Catalog", title: "Components" },
    }),
}));
vi.mock("@/lib/sidebar-sections", () => ({
  familyPath: () => "/families/core",
  getSidebarSections: () => Promise.resolve([]),
  groupedComponents: [
    {
      category: "core",
      items: [
        { name: "button", title: "Button" },
        { name: "mdx-content", title: "MDX content" },
      ],
      label: "Core",
    },
  ],
}));

import ComponentsPage, { generateMetadata } from "./page";

describe("catalog platform query", () => {
  it("matches rendered inventory and structured data to metadata for repeated platform keys", async () => {
    const props = {
      params: Promise.resolve({ locale: "en" as const }),
      searchParams: Promise.resolve({ platform: ["native", "web"] }),
    };
    const html = renderToStaticMarkup(await ComponentsPage(props));
    const metadata = await generateMetadata(props);
    expect(html).toContain("button");
    expect(html).not.toContain("mdx-content");
    expect(html).toContain("/components?platform=native");
    expect(metadata.alternates?.canonical).toContain(
      "/components?platform=native",
    );
  });
});
