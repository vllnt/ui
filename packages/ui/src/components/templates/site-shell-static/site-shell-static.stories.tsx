import { SiteFooter } from "../../molecules/site-footer/site-footer";
import { SiteHeaderStatic } from "../../organisms/site-header-static/site-header-static";

import { SiteShellStatic } from "./site-shell-static";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  args: {
    children: (
      <div className="mx-auto max-w-3xl p-6 text-sm">
        <h1 className="text-2xl font-semibold">Page title</h1>
        <p className="mt-2 text-muted-foreground">
          This page ships no shell script: the header menus are native popovers.
        </p>
      </div>
    ),
    footer: (
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
    ),
    header: (
      <SiteHeaderStatic
        brand="Acme Docs"
        currentHref="/guides"
        homeHref="/"
        items={[
          { bar: "tablet", href: "/guides", label: "Guides" },
          { href: "/about", label: "About" },
        ]}
        labels={{
          home: "Acme home",
          menu: "Menu",
          open: "Open menu",
          primary: "Primary",
        }}
      />
    ),
    mainClassName: "min-h-64",
    skipLabel: "Skip to content",
  },
  component: SiteShellStatic,
  parameters: { layout: "fullscreen" },
  title: "Layout/SiteShellStatic",
} satisfies Meta<typeof SiteShellStatic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
