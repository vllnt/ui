import type { Meta, StoryObj } from "@storybook/react-vite";

import { VideoEmbed } from "./video-embed";

const meta = {
  args: {
    src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Tutorial Video",
  },
  argTypes: {
    aspectRatio: {
      control: "select",
      options: ["1/1", "4/3", "16/9"],
    },
    type: {
      control: "select",
      options: ["custom", "vimeo", "youtube"],
    },
  },
  component: VideoEmbed,
  title: "Components/VideoEmbed",
} satisfies Meta<typeof VideoEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
