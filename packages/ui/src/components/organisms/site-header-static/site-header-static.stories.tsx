import { SiteHeaderStatic } from "./site-header-static";

import type { Meta, StoryObj } from "@storybook/react-vite";

const LABELS = {
  external: "opens in a new tab",
  home: "Acme home",
  menu: "Menu",
  open: "Open menu",
  primary: "Primary",
};

const NETWORK = {
  groups: [
    {
      id: "current",
      items: [{ current: true, href: "https://docs.example.com", label: "Docs" }],
    },
    {
      id: "parent",
      items: [{ current: false, href: "https://example.com", label: "Acme" }],
    },
    {
      heading: "Products",
      id: "products",
      items: [
        { current: false, href: "https://app.example.com", label: "App" },
        { current: false, href: "https://blog.example.com", label: "Blog" },
      ],
    },
  ],
  label: "Acme network",
};

const meta = {
  args: {
    brand: "Acme Docs",
    cta: { href: "/start", label: "Get started" },
    currentHref: "/guides",
    homeHref: "/",
    items: [
      { bar: "tablet", href: "/guides", label: "Guides" },
      { bar: "desktop", href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
    ],
    labels: LABELS,
    network: NETWORK,
  },
  component: SiteHeaderStatic,
  parameters: { layout: "fullscreen" },
  title: "Layout/SiteHeaderStatic",
} satisfies Meta<typeof SiteHeaderStatic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutNetwork: Story = {
  args: {
    network: undefined,
  },
};

export const WithStatus: Story = {
  args: {
    network: undefined,
    status: (
      <span className="rounded-md border border-border px-2 text-xs text-muted-foreground">
        Beta
      </span>
    ),
  },
};
