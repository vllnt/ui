import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button/button";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "./panel";

const meta = {
  component: Panel,
  title: "Core/Panel",
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Panel className="max-w-sm">
      <PanelHeader>
        <PanelTitle>Workspace settings</PanelTitle>
        <PanelDescription>
          Update how your team collaborates.
        </PanelDescription>
      </PanelHeader>
      <PanelBody>
        <p className="text-sm text-muted-foreground">
          Body content goes here.
        </p>
      </PanelBody>
      <PanelFooter className="justify-end gap-2">
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </PanelFooter>
    </Panel>
  ),
};

export const HeaderAndBodyOnly: Story = {
  render: () => (
    <Panel className="max-w-sm">
      <PanelHeader>
        <PanelTitle>Notifications</PanelTitle>
      </PanelHeader>
      <PanelBody>
        <p className="text-sm text-muted-foreground">You are all caught up.</p>
      </PanelBody>
    </Panel>
  ),
};
