import type { Meta, StoryObj } from "@storybook/react-vite";

import type { SiteNetwork } from "../../molecules/network-menu-list/network-menu-list";
import { SiteHeader } from "./site-header";

/* The oss.vllnt.com header: its links, labels and network list, as
 * apps/oss/lib/nav.ts passes them. The component hardcodes none of it. */
const network: SiteNetwork = {
  groups: [
    {
      id: "parent",
      items: [{ current: false, href: "https://vllnt.com", label: "vllnt" }],
    },
    {
      heading: "Platforms",
      id: "platforms",
      items: [
        { current: false, href: "https://maia.vllnt.com", label: "Maia" },
        { current: false, href: "https://console.vllnt.com", label: "Console" },
      ],
    },
    {
      heading: "Learn and build",
      id: "learn-build",
      items: [
        {
          current: false,
          href: "https://blueprint.vllnt.com",
          label: "Blueprint",
        },
        {
          current: false,
          href: "https://community.vllnt.com",
          label: "Community",
        },
        { current: true, href: "https://oss.vllnt.com", label: "Open Source" },
        { current: false, href: "https://ui.vllnt.com", label: "ui" },
      ],
    },
    {
      heading: "Directory",
      id: "directory",
      items: [
        { current: false, href: "https://index.vllnt.com", label: "Index" },
      ],
    },
  ],
  label: "vllnt network",
};

const meta = {
  args: {
    cta: { href: "/packages", label: "Browse packages" },
    currentHref: "/packages",
    homeHref: "/",
    items: [
      { bar: "tablet", href: "/packages", label: "Packages" },
      { bar: "desktop", href: "/packages?category=convex", label: "Convex" },
      { bar: "desktop", href: "/packages?category=ui", label: "UI" },
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
    network,
  },
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
  },
  title: "Navigation/SiteHeader",
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** oss.vllnt.com. Resize below 1200 px for the menu button, below 768 px for
 * the phone menu with the network list. */
export const Default: Story = {};

export const WithLocale: Story = {
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

/** No in-site links, as blueprint.vllnt.com renders it. */
export const BrandAndNetworkOnly: Story = {
  args: {
    cta: undefined,
    items: [],
  },
};
