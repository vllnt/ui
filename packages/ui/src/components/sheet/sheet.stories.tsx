// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  title: "Overlay/Sheet",
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          type="button"
        >
          Open Sheet
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>
            Sheet description with contextual information.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">Sheet body content goes here.</div>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          type="button"
        >
          Open Left
        </button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Left-side navigation panel.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          type="button"
        >
          Open Bottom
        </button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>Bottom-side panel.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
