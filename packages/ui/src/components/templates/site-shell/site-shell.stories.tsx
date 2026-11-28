import { SiteFooter } from "../../molecules/site-footer/site-footer";
import { SiteHeader } from "../../organisms/site-header/site-header";

import { SiteShell } from "./site-shell";

import type { Meta, StoryObj } from "@storybook/react-vite";

const header = (
  <SiteHeader
    brand="Acme Docs"
    currentHref="/guides"
    homeHref="/"
    items={[
      { bar: "tablet", href: "/guides", label: "Guides" },
      { bar: "desktop", href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
    ]}
    labels={{
      close: "Close menu",
      home: "Acme Docs home",
      menu: "Menu",
      open: "Open menu",
      primary: "Primary",
    }}
    network={{
      groups: [
        {
          id: "current",
          items: [
            { current: true, href: "https://docs.example.com", label: "Docs" },
          ],
        },
        {
          id: "parent",
          items: [
            { current: false, href: "https://example.com", label: "Acme" },
          ],
        },
      ],
      label: "Acme network",
    }}
  />
);

const footer = (
  <SiteFooter
    bottom="© 2026 Acme. All rights reserved."
    brand="Acme"
    columns={[
      {
        heading: "Product",
        id: "product",
        links: [
          { href: "/pricing", label: "Pricing" },
          { href: "/changelog", label: "Changelog" },
        ],
      },
      {
        heading: "Sites",
        id: "sites",
        links: [
          { external: true, href: "https://docs.example.com", label: "Docs" },
        ],
      },
    ]}
    navLabel="Footer"
    otherSite="other site"
    tagline="Tools for builders."
  />
);

const meta = {
  args: {
    children: (
      <div className="mx-auto max-w-3xl p-6 text-sm">
        <h1 className="text-2xl font-semibold">Page title</h1>
        <p className="mt-2 text-muted-foreground">
          The page sits in <code>main#main</code>, between the header and the
          footer.
        </p>
      </div>
    ),
    footer,
    header,
    mainClassName: "min-h-64",
    skipLabel: "Skip to content",
  },
  component: SiteShell,
  parameters: { layout: "fullscreen" },
  title: "Layout/SiteShell",
} satisfies Meta<typeof SiteShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithThemeControl: Story = {
  args: {
    settings: {
      theme: {
        label: "Theme",
        options: { dark: "Dark", light: "Light", system: "System" },
      },
    },
  },
};
