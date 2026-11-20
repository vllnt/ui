import { type ReactNode, useRef, useState } from "react";

import {
  Button,
  Dialog,
  Drawer,
  DropdownMenu,
  type DropdownMenuItem,
  Popover,
  Select,
  type SnapPoint,
  Text,
  Tooltip,
  useTheme,
} from "@vllnt/ui-native";
import { View } from "react-native";

const DRAWER_SNAP_POINTS: readonly SnapPoint[] = [0.4, 0.75, 1];
const TOOLTIP_DELAY_MS = 400;
const selectLabels = {
  close: "Close status choices",
  open: "Choose status",
  options: "Status choices",
  placeholder: "No status",
};
const statusOptions = [
  { id: "draft", label: "Draft" },
  { id: "review", label: "In review" },
  { id: "done", label: "Done" },
];
const viewItems = [
  { id: "list", label: "List" },
  { id: "board", label: "Board" },
];

function Demo({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text weight="medium">{title}</Text>
      {children}
    </View>
  );
}
Demo.displayName = "Demo";

/**
 * Bottom drawer with three snap points. Dragging past the smallest point
 * closes it, a fast fling picks the next point, and the handle steps through
 * the points for screen readers.
 */
export function DrawerSnapDemo() {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<null | SnapPoint>(
    DRAWER_SNAP_POINTS[0] ?? null,
  );
  return (
    <Demo title="Drawer with snap points">
      <Button
        onPress={() => {
          setOpen(true);
        }}
        variant="outline"
      >
        Open snap drawer
      </Button>
      <Drawer
        activeSnapPoint={snap}
        closeLabel="Close snap drawer"
        handleLabel="Drawer height"
        onOpenChange={setOpen}
        open={open}
        setActiveSnapPoint={setSnap}
        snapPoints={DRAWER_SNAP_POINTS}
        title="Snap drawer"
      >
        <Text>Active snap point: {String(snap)}</Text>
      </Drawer>
    </Demo>
  );
}
DrawerSnapDemo.displayName = "DrawerSnapDemo";

/**
 * Drawer that opens from the right with `dismissible` off: a drag does not
 * close it, so the close button is the way out.
 */
export function DrawerDirectionDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Demo title="Drawer from the right, not dismissible">
      <Button
        onPress={() => {
          setOpen(true);
        }}
        variant="outline"
      >
        Open side drawer
      </Button>
      <Drawer
        closeLabel="Close side drawer"
        direction="right"
        dismissible={false}
        onOpenChange={setOpen}
        open={open}
        title="Side drawer"
      >
        <Text>Drag is off; use the close button.</Text>
      </Drawer>
    </Demo>
  );
}
DrawerDirectionDemo.displayName = "DrawerDirectionDemo";

/**
 * Dialog drawn in place without a scrim. `modal={false}` keeps the rest of
 * the screen reachable, and `overlay="none"` removes the dimmed backdrop.
 */
export function DialogModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Demo title="Non-modal dialog without scrim">
      <Button
        onPress={() => {
          setOpen((value) => !value);
        }}
        variant="outline"
      >
        {open ? "Hide inline dialog" : "Show inline dialog"}
      </Button>
      <Dialog
        closeLabel="Close inline dialog"
        modal={false}
        onOpenChange={setOpen}
        open={open}
        overlay="none"
        title="Inline dialog"
      >
        <Text>The page behind stays interactive.</Text>
      </Dialog>
    </Demo>
  );
}
DialogModalDemo.displayName = "DialogModalDemo";

/** Popover placed under its trigger, aligned to the trigger's start edge. */
export function PopoverAnchorDemo() {
  const anchorRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  return (
    <Demo title="Popover anchored to its trigger">
      <View ref={anchorRef} style={{ alignSelf: "flex-start" }}>
        <Button
          onPress={() => {
            setOpen(true);
          }}
          variant="outline"
        >
          Open popover
        </Button>
      </View>
      <Popover
        align="start"
        anchorRef={anchorRef}
        cancelLabel="Close popover"
        label="Anchored popover"
        onOpenChange={setOpen}
        open={open}
        side="bottom"
        sideOffset={8}
      >
        <Text>Opens under the trigger.</Text>
      </Popover>
    </Demo>
  );
}
PopoverAnchorDemo.displayName = "PopoverAnchorDemo";

function useMenuState() {
  const [grid, setGrid] = useState(true);
  const [view, setView] = useState("list");
  const items: readonly DropdownMenuItem[] = [
    { id: "rename", label: "Rename" },
    {
      checked: grid,
      id: "grid",
      kind: "checkbox",
      label: "Show grid",
      onCheckedChange: setGrid,
    },
    {
      id: "view",
      items: viewItems,
      kind: "radio-group",
      label: "Layout",
      onValueChange: setView,
      value: view,
    },
    {
      id: "share",
      items: [
        { id: "link", label: "Copy link" },
        { id: "mail", label: "Email" },
      ],
      kind: "sub",
      label: "Share",
    },
    { destructive: true, id: "delete", label: "Delete" },
  ];
  return { grid, items, view };
}

/**
 * Dropdown menu with a checkbox row, a radio group and a sub-menu. The
 * checkbox and radio state belong to the screen, as with Radix.
 */
export function DropdownMenuDemo() {
  const anchorRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const { grid, items, view } = useMenuState();
  return (
    <Demo title="Dropdown menu with checkbox, radio and sub-menu">
      <View ref={anchorRef} style={{ alignSelf: "flex-start" }}>
        <Button
          onPress={() => {
            setOpen(true);
          }}
          variant="outline"
        >
          Open menu
        </Button>
      </View>
      <DropdownMenu
        align="start"
        anchorRef={anchorRef}
        cancelLabel="Close menu"
        items={items}
        label="Project actions"
        onOpenChange={setOpen}
        open={open}
      />
      <Text size="small" tone="muted">
        Grid {grid ? "on" : "off"}, layout {view}
      </Text>
    </Demo>
  );
}
DropdownMenuDemo.displayName = "DropdownMenuDemo";

/** Tooltip that waits 400 ms after the press, placed above its trigger. */
export function TooltipDelayDemo() {
  return (
    <Demo title="Tooltip with a delay">
      <Tooltip
        closeLabel="Close help"
        delayDuration={TOOLTIP_DELAY_MS}
        helpHint="Shows help after a short delay"
        label="Project help"
        side="top"
        trigger={<Text>Project help</Text>}
        triggerLabel="Show project help"
      >
        <Text>Projects group related work.</Text>
      </Tooltip>
    </Demo>
  );
}
TooltipDelayDemo.displayName = "TooltipDelayDemo";

/** Select with its list controlled by the screen and a required hint. */
export function SelectRequiredDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Demo title="Required select with a controlled list">
      <Select
        labels={selectLabels}
        onOpenChange={setOpen}
        open={open}
        options={statusOptions}
        required
        requiredLabel="Required"
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />
      <Text size="small" tone="muted">
        List is {open ? "open" : "closed"}
      </Text>
    </Demo>
  );
}
SelectRequiredDemo.displayName = "SelectRequiredDemo";

/** Every overlay props-parity demo, one after the other. */
export function OverlayDemos() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[4] }}>
      <DrawerSnapDemo />
      <DrawerDirectionDemo />
      <DialogModalDemo />
      <PopoverAnchorDemo />
      <DropdownMenuDemo />
      <TooltipDelayDemo />
      <SelectRequiredDemo />
    </View>
  );
}
OverlayDemos.displayName = "OverlayDemos";
