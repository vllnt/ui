// manual
import { useEffect } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { toast } from "./toast-api";
import { Toaster } from "./toaster";

const STAY = { duration: Number.POSITIVE_INFINITY };

type DemoProperties = React.ComponentProps<typeof Toaster> & {
  show: () => void;
};

function Demo({ show, ...properties }: DemoProperties) {
  useEffect(() => {
    show();
    return () => {
      toast.dismiss();
    };
  }, [show]);

  return <Toaster {...properties} />;
}

const meta = {
  component: Toaster,
  parameters: {
    a11y: {
      test: "todo",
    },
    layout: "fullscreen",
  },
  title: "Overlay/Toaster",
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

function showTypes() {
  toast("Event created", { ...STAY, id: "default" });
  toast.success("Changes saved", {
    ...STAY,
    description: "Your profile is up to date.",
    id: "success",
  });
  toast.info("A new version is available", { ...STAY, id: "info" });
  toast.warning("Storage is almost full", {
    ...STAY,
    description: "Free up space to keep syncing.",
    id: "warning",
  });
  toast.error("Couldn't save changes", { ...STAY, id: "error" });
  toast.loading("Uploading photos", { id: "loading" });
}

export const Types: Story = {
  render: () => <Demo expand show={showTypes} visibleToasts={6} />,
};

function showStack() {
  toast("Event created", {
    ...STAY,
    description: "Friday, June 12 at 10:00 AM",
    id: "first",
  });
  toast.success("Changes saved", { ...STAY, id: "second" });
  toast.info("A new version is available", { ...STAY, id: "third" });
}

export const Stack: Story = {
  render: () => <Demo show={showStack} />,
};

function showActions() {
  toast("Message archived", {
    ...STAY,
    action: { label: "Undo", onClick: () => undefined },
    cancel: { label: "Dismiss", onClick: () => undefined },
    description: "It moved to the archive folder.",
    id: "archive",
  });
  toast.error("Payment failed", {
    ...STAY,
    action: { label: "Retry", onClick: () => undefined },
    id: "payment",
  });
}

export const Actions: Story = {
  render: () => <Demo closeButton expand show={showActions} />,
};

function showRich() {
  toast.success("Changes saved", { ...STAY, id: "success" });
  toast.info("A new version is available", { ...STAY, id: "info" });
  toast.warning("Storage is almost full", { ...STAY, id: "warning" });
  toast.error("Couldn't save changes", { ...STAY, id: "error" });
}

export const RichColors: Story = {
  render: () => <Demo expand richColors show={showRich} visibleToasts={4} />,
};

function showTop() {
  toast.success("Changes saved", {
    ...STAY,
    description: "Your profile is up to date.",
    id: "top",
  });
}

export const TopCenter: Story = {
  render: () => <Demo position="top-center" show={showTop} />,
};
