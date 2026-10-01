// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../input/input";
import { Label } from "../label/label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  args: {
    children: (
      <>
        <PopoverTrigger className="rounded-md border px-4 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Dimensions
        </PopoverTrigger>
        <PopoverContent aria-labelledby="popover-dimensions-title">
          <div className="grid gap-3">
            <p className="text-sm font-semibold" id="popover-dimensions-title">
              Dimensions
            </p>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="popover-width">Width</Label>
              <Input className="col-span-2 h-8" defaultValue="100%" id="popover-width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="popover-height">Height</Label>
              <Input className="col-span-2 h-8" defaultValue="25px" id="popover-height" />
            </div>
          </div>
        </PopoverContent>
      </>
    ),
  },
  component: Popover,
  parameters: {
    layout: "centered",
  },
  title: "Overlay/Popover",
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
