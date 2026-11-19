import type { Meta, StoryObj } from "@storybook/react-vite";

import type { SiteNetwork } from "../../molecules/network-menu-list/network-menu-list";
import { NetworkSwitcher } from "./network-switcher";

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
        { current: true, href: "https://oss.vllnt.com", label: "Open Source" },
        { current: false, href: "https://ui.vllnt.com", label: "ui" },
      ],
    },
  ],
  label: "vllnt network",
};

const meta = {
  args: { network: vllntNetwork },
  component: NetworkSwitcher,
  decorators: [
    (Story) => (
      <div className="h-96 p-4">
        <Story />
      </div>
    ),
  ],
  title: "Navigation/NetworkSwitcher",
} satisfies Meta<typeof NetworkSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shows from 768 px; open it with the button. */
export const Default: Story = {};
