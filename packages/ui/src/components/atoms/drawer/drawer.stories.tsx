// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

const meta = {
  args: {
    children: (
      <>
        <DrawerTrigger className="rounded-md border px-4 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Open Drawer
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <p className="px-4 text-4xl font-semibold tabular-nums">350 kcal</p>
          <DrawerFooter>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              type="button"
            >
              Save goal
            </button>
            <DrawerClose className="rounded-md border px-4 py-2 text-sm">
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </>
    ),
  },
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  title: "Overlay/Drawer",
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
