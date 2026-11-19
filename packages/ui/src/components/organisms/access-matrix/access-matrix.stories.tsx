import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { AccessMatrix, type AccessMatrixValue } from "./access-matrix";

const sampleSubjects = [
  { description: "Manage members and billing", id: "owners", label: "Owners" },
  { description: "Edit network policy", id: "network", label: "Network team" },
  { id: "viewers", label: "Viewers" },
];

const samplePermissions = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "invite", label: "Invite" },
];

const sampleValue: AccessMatrixValue = {
  network: { invite: "denied", read: "inherited", write: "granted" },
  owners: { invite: "granted", read: "granted", write: "granted" },
  viewers: { invite: "denied", read: "granted", write: "denied" },
};

const meta = {
  args: {
    permissions: samplePermissions,
    subjects: sampleSubjects,
    title: "Team permissions",
    value: sampleValue,
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["grid", "list"],
    },
  },
  component: AccessMatrix,
  title: "Data/AccessMatrix",
} satisfies Meta<typeof AccessMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const List: Story = {
  args: {
    mode: "list",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState(args.value);

    return (
      <AccessMatrix
        {...args}
        onChange={(subjectId, permissionId, next) => {
          setCurrent((previous) => ({
            ...previous,
            [subjectId]: { ...previous[subjectId], [permissionId]: next },
          }));
        }}
        value={current}
      />
    );
  },
};

export const CustomLabels: Story = {
  args: {
    labels: {
      denied: "Refuse",
      granted: "Autorise",
      inherited: "Herite",
    },
    title: "Droits de l'equipe",
  },
};
