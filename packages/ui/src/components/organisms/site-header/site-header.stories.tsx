import { SiteHeader } from "./site-header";

import type { Meta, StoryObj } from "@storybook/react-vite";

const LABELS = {
  close: "Close menu",
  external: "opens in a new tab",
  home: "Acme Docs home",
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
      { external: true, href: "https://status.example.com", label: "Status" },
    ],
    labels: LABELS,
    network: NETWORK,
  },
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  title: "Layout/SiteHeader",
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutNetwork: Story = {
  args: {
    network: undefined,
  },
};

export const WithLocaleLink: Story = {
  args: {
    locale: {
      ariaLabel: "FR, Read this page in French",
      href: "/fr",
      hrefLang: "fr",
      label: "FR",
      name: "Français",
    },
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <button
        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
        type="button"
      >
        Search
      </button>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    cta: undefined,
    items: [],
    network: undefined,
  },
};
