import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "../button/button";

const meta = {
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  title: "Overlay/Tooltip",
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/** `TooltipArrow` points at the trigger from the side the tooltip lands on. */
export const WithArrow: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <TooltipArrow />
        <p>Tooltip with an arrow</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/** `closeDelay` keeps the tooltip open for 300 ms after the pointer leaves. */
export const CloseDelay: Story = {
  render: () => (
    <Tooltip closeDelay={300}>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover, then leave</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Stays for 300 ms</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/** `toggleable`: a press opens and closes it, so it works on touch screens. */
export const Toggleable: Story = {
  render: () => (
    <Tooltip toggleable>
      <TooltipTrigger asChild>
        <Button aria-label="About storage" size="icon" variant="outline">
          ?
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Files count toward your storage.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

