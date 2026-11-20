import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { Breadcrumb } from "./breadcrumb";

const meta = {
  args: {
    items: [{
        label: "Content",
      }],
  },
  component: Breadcrumb,
  title: "Navigation/Breadcrumb",
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const TRAIL = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/ui", label: "UI" },
  { href: "/docs/ui/atoms", label: "Atoms" },
  { label: "Breadcrumb" },
];

function LocaleLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}): ReactNode {
  return (
    <a className={className} href={`/fr${href}`}>
      {children}
    </a>
  );
}

export const Default: Story = {};

export const CurrentPage: Story = {
  args: {
    items: TRAIL.slice(0, 3),
  },
};

export const Collapsed: Story = {
  args: {
    items: TRAIL,
    overflow: "collapsed",
  },
};

export const Localised: Story = {
  args: {
    items: [
      { href: "/", label: "Accueil" },
      { href: "/docs", label: "Documentation" },
      { href: "/docs/ui", label: "Interface" },
      { href: "/docs/ui/atoms", label: "Atomes" },
      { label: "Fil d'Ariane" },
    ],
    labels: { more: "Plus", region: "Fil d'Ariane" },
    overflow: "collapsed",
  },
};

export const CustomLinkComponent: Story = {
  args: {
    items: TRAIL.slice(0, 3),
    linkComponent: LocaleLink,
  },
};

export const Slash: Story = {
  args: {
    items: TRAIL.slice(0, 3),
    separator: "slash",
  },
};

export const Minimal: Story = {
  args: {
    items: TRAIL.slice(0, 3),
    variant: "minimal",
  },
};
