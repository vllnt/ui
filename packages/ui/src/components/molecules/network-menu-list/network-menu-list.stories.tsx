import type { Meta, StoryObj } from "@storybook/react-vite";

import { NetworkMenuList, type SiteNetwork } from "./network-menu-list";

/* The oss.vllnt.com list, as `networkSwitcherGroups({ currentSite: "oss" })`
 * builds it. The data lives in the app; the component hardcodes none. */
const vllntNetwork: SiteNetwork = {
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
  args: { network: vllntNetwork },
  component: NetworkMenuList,
  decorators: [
    (Story) => (
      <div className="w-72 p-2">
        <Story />
      </div>
    ),
  ],
  title: "Navigation/NetworkMenuList",
} satisfies Meta<typeof NetworkMenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Untitled: Story = {
  args: { titled: false },
};
