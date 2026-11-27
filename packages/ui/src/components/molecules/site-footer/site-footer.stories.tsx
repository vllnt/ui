import { SiteFooter } from "./site-footer";

import type { Meta, StoryObj } from "@storybook/react-vite";

const COLUMNS = [
  {
    heading: "Product",
    id: "product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
  {
    heading: "Company",
    id: "company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    heading: "Sites",
    id: "sites",
    links: [
      { external: true, href: "https://docs.example.com", label: "Docs" },
      { external: true, href: "https://blog.example.com", label: "Blog" },
    ],
  },
  {
    heading: "Legal",
    id: "legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

const meta = {
  args: {
    bottom: "© 2026 Acme. All rights reserved.",
    brand: "Acme",
    columns: COLUMNS,
    navLabel: "Footer",
    otherSite: "other site",
    tagline: "Tools for builders.",
  },
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  title: "Layout/SiteFooter",
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FiveColumns: Story = {
  args: {
    columns: [
      ...COLUMNS,
      {
        heading: "Directory",
        id: "directory",
        links: [{ external: true, href: "https://example.com", label: "Index" }],
      },
    ],
  },
};

export const OneColumnNoBottom: Story = {
  args: {
    bottom: undefined,
    columns: COLUMNS.slice(0, 1),
  },
};
