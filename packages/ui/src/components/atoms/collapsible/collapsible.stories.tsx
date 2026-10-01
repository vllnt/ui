// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

const meta = {
  args: {
    children: (
      <>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">3 starred repositories</p>
          <CollapsibleTrigger className="rounded-md border px-3 py-1 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Toggle list
          </CollapsibleTrigger>
        </div>
        <p className="rounded-md border px-4 py-2 font-mono text-sm">vllnt/ui</p>
        <CollapsibleContent className="space-y-2">
          <p className="rounded-md border px-4 py-2 font-mono text-sm">radix-ui/primitives</p>
          <p className="rounded-md border px-4 py-2 font-mono text-sm">vercel/next.js</p>
        </CollapsibleContent>
      </>
    ),
    className: "w-[320px] space-y-2",
  },
  component: Collapsible,
  title: "Content/Collapsible",
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
