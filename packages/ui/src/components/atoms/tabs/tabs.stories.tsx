import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  args: {
    children: null,
    defaultValue: "account",
  },
  component: Tabs,
  title: "Navigation/Tabs",
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Tab to the active tab, then use ArrowLeft / ArrowRight (or Home / End) to
 * move between tabs; the focused tab is activated.
 */
export const Default: Story = {
  render: (args) => (
    <Tabs {...args} className="w-full max-w-md">
      <TabsList aria-label="Account settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm">Update your name and email address.</p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm">Change your password and sign out elsewhere.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-sm">Choose which emails you receive.</p>
      </TabsContent>
    </Tabs>
  ),
};
