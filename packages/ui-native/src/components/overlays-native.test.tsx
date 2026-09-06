import { useState } from "react";

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AccessibilityInfo, Modal, Text } from "react-native";

import type { ShareService } from "../primitives/platform-services";

import { AlertDialog } from "./alert-dialog/alert-dialog";
import { Command } from "./command/command";
import { ContextMenu } from "./context-menu/context-menu";
import { Dialog } from "./dialog/dialog";
import { Drawer } from "./drawer/drawer";
import { DropdownMenu } from "./dropdown-menu/dropdown-menu";
import { Popover } from "./popover/popover";
import { ShareDialog } from "./share-dialog/share-dialog";
import { Sheet } from "./sheet/sheet";
import { Toast, type ToastItem } from "./toast/toast";
import { Tooltip } from "./tooltip/tooltip";

function ToastHarness({ initial }: { readonly initial: readonly ToastItem[] }) {
  const [toasts, setToasts] = useState(initial);
  return (
    <Toast
      closeLabel="Dismiss notification"
      onToastsChange={setToasts}
      toasts={toasts}
    />
  );
}
ToastHarness.displayName = "ToastHarness";

describe("native overlays", () => {
  it("opens and closes a dialog through controls, back, and accessibility escape", () => {
    const onOpenChange = jest.fn();
    const onRequestClose = jest.fn();
    const view = render(
      <Dialog
        closeLabel="Close dialog"
        defaultOpen
        onOpenChange={onOpenChange}
        onRequestClose={onRequestClose}
        safeArea={(content) => (
          <>
            <Text>Host safe area</Text>
            {content}
          </>
        )}
        title="Preferences"
      >
        <Text>Dialog body</Text>
      </Dialog>,
    );

    expect(screen.getByText("Host safe area")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    view.rerender(
      <Dialog
        closeLabel="Close dialog"
        onOpenChange={onOpenChange}
        onRequestClose={onRequestClose}
        open
        title="Preferences"
      >
        <Text>Dialog body</Text>
      </Dialog>,
    );
    fireEvent(screen.getByLabelText("Preferences"), "accessibilityEscape");
    expect(onRequestClose).toHaveBeenCalledWith("accessibilityEscape");
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose", {
      nativeEvent: {},
    });
    expect(onRequestClose).toHaveBeenCalledWith("requestClose");
  });

  it("requires an enabled destructive confirmation before closing", () => {
    const onAction = jest.fn();
    const onOpenChange = jest.fn();
    const view = render(
      <AlertDialog
        actionDisabled
        actionLabel="Delete workspace"
        cancelLabel="Keep workspace"
        defaultOpen
        description="This cannot be undone."
        onAction={onAction}
        onOpenChange={onOpenChange}
        title="Delete workspace?"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete workspace" }),
    ).toBeDisabled();
    fireEvent.press(screen.getByRole("button", { name: "Delete workspace" }));
    expect(onAction).not.toHaveBeenCalled();

    view.rerender(
      <AlertDialog
        actionLabel="Delete workspace"
        cancelLabel="Keep workspace"
        defaultOpen
        description="This cannot be undone."
        onAction={onAction}
        onOpenChange={onOpenChange}
        title="Delete workspace?"
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Delete workspace" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("reports unavailable and available native sharing truthfully", async () => {
    const share: ShareService = {
      share: jest.fn(async () => ({ status: "shared" as const })),
    };
    const onShareResult = jest.fn();
    const unavailable = render(
      <ShareDialog
        cancelLabel="Cancel"
        content={{ message: "Native UI" }}
        defaultOpen
        shareLabel="Share now"
        shareService={null}
        title="Share"
        unavailableLabel="Sharing unavailable"
      />,
    );

    expect(screen.getByText("Sharing unavailable")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Sharing unavailable" }),
    ).toBeDisabled();
    unavailable.unmount();

    const partialOverride = render(
      <ShareDialog
        cancelLabel="Cancel"
        content={{ message: "Native UI" }}
        defaultOpen
        services={{
          clipboard: {
            getText: async () => "",
            setText: async () => {},
          },
        }}
        shareLabel="Share now"
        title="Share"
        unavailableLabel="Sharing unavailable"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Share now" }),
    ).not.toBeDisabled();
    partialOverride.unmount();

    render(
      <ShareDialog
        cancelLabel="Cancel"
        content={{ message: "Native UI" }}
        defaultOpen
        onShareResult={onShareResult}
        services={{ share }}
        shareLabel="Share now"
        title="Share"
        unavailableLabel="Sharing unavailable"
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Share now" }));
    await waitFor(() => {
      expect(share.share).toHaveBeenCalledWith(
        { message: "Native UI" },
        undefined,
      );
      expect(onShareResult).toHaveBeenCalledWith({ status: "shared" as const });
    });
  });

  it("selects stable IDs and respects disabled and destructive menu states", () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu
        cancelLabel="Cancel menu"
        defaultOpen
        items={[
          { disabled: true, id: "rename", label: "Rename" },
          { destructive: true, id: "delete", label: "Delete" },
        ]}
        label="File actions"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeDisabled();
    fireEvent.press(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).toHaveBeenCalledWith("delete");
  });

  it("filters and selects commands by stable ID", () => {
    const onSelect = jest.fn();
    render(
      <Command
        cancelLabel="Close commands"
        defaultOpen
        emptyLabel="No commands"
        items={[
          { id: 1, keywords: ["preferences"], label: "Open settings" },
          { id: 2, label: "Create project" },
        ]}
        label="Command menu"
        onSelect={onSelect}
        placeholder="Search commands"
      />,
    );

    fireEvent.changeText(
      screen.getByLabelText("Search commands"),
      "preferences",
    );
    expect(screen.queryByText("Create project")).not.toBeOnTheScreen();
    fireEvent.press(screen.getByRole("menuitem", { name: "Open settings" }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("uses native modal surfaces for context menu, popover, drawer, and sheet", () => {
    const onContextSelect = jest.fn();
    const context = render(
      <ContextMenu
        cancelLabel="Cancel actions"
        defaultOpen
        items={[{ id: "copy", label: "Copy" }]}
        label="Actions"
        onSelect={onContextSelect}
      />,
    );
    fireEvent.press(screen.getByRole("menuitem", { name: "Copy" }));
    expect(onContextSelect).toHaveBeenCalledWith("copy");
    context.unmount();

    const overlays = [
      <Popover
        cancelLabel="Close details"
        defaultOpen
        key="popover"
        label="Details"
      >
        <Text>Details body</Text>
      </Popover>,
      <Drawer closeLabel="Close drawer" defaultOpen key="drawer" title="Drawer">
        <Text>Drawer body</Text>
      </Drawer>,
      <Sheet
        closeLabel="Close sheet"
        defaultOpen
        key="sheet"
        side="left"
        title="Sheet"
      >
        <Text>Sheet body</Text>
      </Sheet>,
    ];
    overlays.forEach((overlay) => {
      const rendered = render(overlay);
      expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(true);
      rendered.unmount();
    });
  });

  it("opens tooltip help explicitly by press and does not depend on hover", () => {
    render(
      <Tooltip
        closeLabel="Close help"
        helpHint="Shows help"
        label="Account help"
        trigger={<Text>?</Text>}
        triggerLabel="Show account help"
      >
        <Text>Use your work email.</Text>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Show account help" });
    fireEvent(trigger, "focus");
    expect(screen.queryByText("Use your work email.")).toBeNull();
    fireEvent.press(trigger);
    expect(screen.getByText("Use your work email.")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close help" }));
  });

  it("announces toast entries and removes them with deterministic timers", () => {
    jest.useFakeTimers();
    const announce = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(() => {});
    render(
      <ToastHarness
        initial={[
          {
            description: "Your changes are stored.",
            duration: 1000,
            id: "saved",
            title: "Saved",
          },
        ]}
      />,
    );

    expect(announce).toHaveBeenCalledWith("Saved. Your changes are stored.");
    expect(screen.getByText("Saved")).toBeOnTheScreen();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Saved")).not.toBeOnTheScreen();
    announce.mockRestore();
    jest.useRealTimers();
  });
});
