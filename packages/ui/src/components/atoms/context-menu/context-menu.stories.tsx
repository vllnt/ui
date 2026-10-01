// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

const meta = {
  args: {
    children: (
      <>
        <ContextMenuTrigger
          className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed px-4 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          tabIndex={0}
        >
          Right-click here, or focus and press Shift+F10
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem>
            Back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            Forward <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>Show bookmarks</ContextMenuCheckboxItem>
        </ContextMenuContent>
      </>
    ),
  },
  component: ContextMenu,
  parameters: {
    layout: "centered",
  },
  title: "Overlay/ContextMenu",
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
