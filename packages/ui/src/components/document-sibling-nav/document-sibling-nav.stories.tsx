import type { Meta, StoryObj } from "@storybook/react-vite";

import { DocumentSiblingNav } from "./document-sibling-nav";

const FOO = { href: "/posts/foo", title: "Why thin clients are back" };
const BAR = { href: "/posts/bar", title: "What we shipped this quarter" };

const meta = {
  args: {
    next: BAR,
    previous: FOO,
    variant: "with-title",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["compact", "with-title", "with-meta"],
    },
  },
  component: DocumentSiblingNav,
  title: "Content/DocumentSiblingNav",
} satisfies Meta<typeof DocumentSiblingNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnlyPrevious: Story = {
  args: {
    next: undefined,
    previous: FOO,
  },
};

export const OnlyNext: Story = {
  args: {
    next: BAR,
    previous: undefined,
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
  },
};

export const WithMeta: Story = {
  args: {
    next: { ...BAR, meta: "May 2026" },
    previous: { ...FOO, meta: "April 2026" },
    variant: "with-meta",
  },
};

export const Localized: Story = {
  args: {
    labels: {
      navigation: "Navigation des articles",
      next: "Suivant",
      previous: "Précédent",
    },
  },
};
