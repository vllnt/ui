import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShareDialogPeople } from "./share-dialog-people";

const noop = (): void => undefined;

const meta = {
  args: {
    kind: "list",
    layout: "desktop",
    linkUrl: "https://ui.vllnt.com/share/launch-plan",
    onClose: noop,
    onRemove: noop,
    people: [
      {
        email: "ada@example.com",
        id: "ada",
        name: "Ada Lovelace",
        role: "owner",
      },
      {
        email: "alan@example.com",
        id: "alan",
        name: "Alan Turing",
        role: "editor",
      },
      {
        email: "grace@example.com",
        id: "grace",
        name: "Grace Hopper",
        role: "viewer",
      },
    ],
    roles: [
      { label: "Viewer", value: "viewer" },
      { label: "Editor", value: "editor" },
      { label: "Owner", value: "owner" },
    ],
    title: "Share launch plan",
  },
  argTypes: {
    kind: {
      control: "select",
      options: ["list", "invite"],
    },
    layout: {
      control: "select",
      options: ["desktop", "phone"],
    },
  },
  component: ShareDialogPeople,
  title: "Utility/ShareDialogPeople",
} satisfies Meta<typeof ShareDialogPeople>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invite: Story = {
  args: { kind: "invite" },
};

export const Phone: Story = {
  args: { layout: "phone" },
};

export const PhoneInvite: Story = {
  args: { kind: "invite", layout: "phone" },
};

export const Empty: Story = {
  args: { people: [] },
};

export const WithoutLink: Story = {
  args: { linkUrl: undefined },
};
