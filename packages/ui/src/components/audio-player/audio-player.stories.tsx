import type { Meta, StoryObj } from "@storybook/react-vite";

import { AudioPlayer } from "./audio-player";

const meta = {
  title: "Components/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
  args: { src: "https://upload.wikimedia.org/wikipedia/commons/4/45/En-us-hello.ogg", title: "Hello pronunciation" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof AudioPlayer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithTranscript: Story = { args: { transcript: "Hello.", showPlaybackRate: true } };
export const MissingSource: Story = { args: { src: "" } };
export const UnavailableSource: Story = { args: { src: "/unavailable-audio.wav" } };
