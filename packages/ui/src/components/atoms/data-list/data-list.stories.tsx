import type { Meta, StoryObj } from "@storybook/react-vite";

import { DataList, DataListItem, DataListLabel, DataListValue } from "./data-list";

const meta = {
  component: DataList,
  title: "Data/DataList",
} satisfies Meta<typeof DataList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DataList>
      <DataListItem>
        <DataListLabel>Environment</DataListLabel>
        <DataListValue>Production</DataListValue>
      </DataListItem>
      <DataListItem>
        <DataListLabel>Owner</DataListLabel>
        <DataListValue>Platform team</DataListValue>
      </DataListItem>
      <DataListItem>
        <DataListLabel>Rollout</DataListLabel>
        <DataListValue>25% of traffic</DataListValue>
      </DataListItem>
    </DataList>
  ),
};

export const Compact: Story = {
  render: () => (
    <DataList density="compact">
      <DataListItem>
        <DataListLabel>Request ID</DataListLabel>
        <DataListValue>req_01HZZ1N6M8P8</DataListValue>
      </DataListItem>
      <DataListItem>
        <DataListLabel>Updated</DataListLabel>
        <DataListValue>2 minutes ago</DataListValue>
      </DataListItem>
      <DataListItem>
        <DataListLabel>Region</DataListLabel>
        <DataListValue>eu-west-1</DataListValue>
      </DataListItem>
    </DataList>
  ),
};