import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback } from "../../atoms/avatar/avatar";
import { Switch } from "../../atoms/switch/switch";
import { SettingsList, SettingsListItem } from "./settings-list";

const meta = {
  args: {
    description: "Manage your profile, alerts and privacy.",
    title: "Personal settings",
    variant: "inset-grouped",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["inset-grouped", "plain"],
    },
  },
  component: SettingsList,
  render: (args) => (
    <SettingsList {...args} className="max-w-md">
      <SettingsListItem
        description="Profile, email and password"
        href="/account"
        label="Account"
        leading={
          <Avatar>
            <AvatarFallback>BN</AvatarFallback>
          </Avatar>
        }
      />
      <SettingsListItem
        control={<Switch defaultChecked />}
        description="Push alerts for mentions and replies"
        label="Notifications"
      />
      <SettingsListItem
        href="/privacy"
        label="Privacy"
        meta="Friends only"
      />
      <SettingsListItem control={<Switch />} label="Sounds" />
    </SettingsList>
  ),
  title: "Account & Billing/SettingsList",
} satisfies Meta<typeof SettingsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Plain: Story = {
  args: {
    variant: "plain",
  },
};

export const WithoutHeader: Story = {
  args: {
    description: undefined,
    title: undefined,
  },
};

export const Empty: Story = {
  render: (args) => <SettingsList {...args} className="max-w-md" />,
};
