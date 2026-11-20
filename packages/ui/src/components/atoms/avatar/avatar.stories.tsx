import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bot } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarPresence,
  type AvatarSize,
} from "./avatar";

const portrait = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#94a3b8'/><circle cx='32' cy='26' r='12' fill='#f1f5f9'/><path d='M10 64c3-16 14-22 22-22s19 6 22 22z' fill='#f1f5f9'/></svg>",
)}`;

const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"];

const presences: { label: string; presence: AvatarPresence }[] = [
  { label: "Online", presence: "online" },
  { label: "Away", presence: "away" },
  { label: "Busy", presence: "busy" },
];

const meta = {
  component: Avatar,
  title: "Core/Avatar",
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {sizes.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="circle" size="lg">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar shape="square" size="lg">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Presence: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {presences.map(({ label, presence }) => (
        <div className="flex items-center gap-2" key={presence}>
          <Avatar presence={presence} size="lg">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  ),
};

export const PresenceSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {sizes.map((size) => (
        <Avatar key={size} presence="busy" size={size}>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const PresenceSquare: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {presences.map(({ presence }) => (
        <Avatar key={presence} presence={presence} shape="square" size="lg">
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const PresenceLabels: Story = {
  render: () => (
    <Avatar
      presence="online"
      presenceLabels={{ away: "Absent", busy: "Occupe", online: "En ligne" }}
      size="lg"
    >
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const KindPerson: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage alt="Ada Lovelace" src={portrait} />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const KindInitials: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const KindOrg: Story = {
  render: () => (
    <Avatar shape="square" size="lg">
      <AvatarFallback>AC</AvatarFallback>
    </Avatar>
  ),
};

export const KindAgent: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarFallback>
        <Bot aria-label="Agent" className="size-1/2" role="img" />
      </AvatarFallback>
    </Avatar>
  ),
};
