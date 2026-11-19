// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  title: "Overlay/Dialog",
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          type="button"
        >
          Open Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of the dialog content. It provides context for
            the action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button
              className="rounded bg-secondary px-4 py-2 text-secondary-foreground"
              type="button"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            className="rounded bg-primary px-4 py-2 text-primary-foreground"
            type="button"
          >
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** `overlay="none"` draws no veil: the page stays fully visible behind the dialog, which is still modal. */
export const NoOverlay: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          type="button"
        >
          Open Dialog Without Overlay
        </button>
      </DialogTrigger>
      <DialogContent overlay="none">
        <DialogHeader>
          <DialogTitle>No overlay</DialogTitle>
          <DialogDescription>
            The page behind is not dimmed or blurred. Focus is still trapped and
            Escape still closes the dialog.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button
              className="rounded bg-secondary px-4 py-2 text-secondary-foreground"
              type="button"
            >
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
