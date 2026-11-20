import { type ReactElement, useRef } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import {
  AccessibilityInfo,
  BackHandler,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { Dialog } from "../components/atoms/dialog/dialog";
import { Drawer } from "../components/atoms/drawer/drawer";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type DropdownMenuProps,
} from "../components/atoms/dropdown-menu/dropdown-menu";
import {
  Popover,
  type PopoverProps,
} from "../components/atoms/popover/popover";
import { Select } from "../components/atoms/select/select";
import { Sheet } from "../components/atoms/sheet/sheet";
import {
  Tooltip,
  type TooltipProps,
} from "../components/atoms/tooltip/tooltip";

import { advanceTimers, flushMicrotasks, styleOf } from "./test-utils";

type Probe = {
  readonly props: Readonly<Record<string, unknown>>;
  readonly type: unknown;
};

type OverlayProps = {
  readonly modal?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (
    reason: "accessibilityEscape" | "requestClose",
  ) => void;
  readonly open?: boolean;
};

type OverlayCase = {
  readonly build: (props: OverlayProps) => ReactElement;
  readonly focusesWhenModal: boolean;
  readonly name: string;
};

const OVERLAYS: readonly OverlayCase[] = [
  {
    build: (props) => <Dialog {...props} closeLabel="Close" title="Overlay" />,
    focusesWhenModal: false,
    name: "Dialog",
  },
  {
    build: (props) => <Sheet {...props} closeLabel="Close" title="Overlay" />,
    focusesWhenModal: false,
    name: "Sheet",
  },
  {
    build: (props) => <Drawer {...props} closeLabel="Close" title="Overlay" />,
    focusesWhenModal: true,
    name: "Drawer",
  },
  {
    build: (props) => (
      <Popover {...props} cancelLabel="Close" label="Overlay" />
    ),
    focusesWhenModal: false,
    name: "Popover",
  },
  {
    build: (props) => (
      <DropdownMenu
        {...props}
        cancelLabel="Close"
        items={[{ id: "a", label: "A" }]}
        label="Overlay"
      />
    ),
    focusesWhenModal: true,
    name: "DropdownMenu",
  },
];

const ANCHOR = { height: 40, width: 80, x: 100, y: 300 };
const PANEL_LAYOUT = {
  nativeEvent: { layout: { height: 100, width: 200, x: 0, y: 0 } },
};

let focusSpy: jest.SpyInstance;
let backSpy: jest.SpyInstance | undefined;
let anchorSpy: jest.SpyInstance | undefined;

beforeEach(() => {
  focusSpy = jest
    .spyOn(AccessibilityInfo, "sendAccessibilityEvent")
    .mockImplementation(() => {});
});

afterEach(() => {
  focusSpy.mockRestore();
  backSpy?.mockRestore();
  backSpy = undefined;
  anchorSpy?.mockRestore();
  anchorSpy = undefined;
});

function hostNode() {
  return { measure: jest.fn() };
}

function mockAnchor(box = ANCHOR) {
  const spy = jest
    .spyOn(View.prototype, "measureInWindow")
    .mockImplementation((callback) => {
      callback(box.x, box.y, box.width, box.height);
    });
  anchorSpy = spy;
  return spy;
}

function backHandlerSpy() {
  const remove = jest.fn();
  const add = jest
    .spyOn(BackHandler, "addEventListener")
    .mockReturnValue({ remove });
  backSpy = add;
  const pressBack = () => {
    const listener = add.mock.calls.at(-1)?.[1];
    act(() => {
      expect(listener?.({ timeStamp: 0, type: "hardwareBackPress" })).toBe(
        true,
      );
    });
  };
  return { add, pressBack, remove };
}

function isHost(value: unknown): value is Probe {
  return typeof value === "object" && value !== null && "props" in value;
}

function asHost(value: unknown): Probe {
  if (!isHost(value)) throw new Error("Expected a rendered element");
  return value;
}

function layoutHost(): Probe {
  const found: unknown[] = screen.UNSAFE_root.findAll(
    (node: Probe) =>
      typeof node.type === "string" &&
      typeof node.props.onLayout === "function",
  );
  const panel = found.at(-1);
  if (!panel) throw new Error("No laid-out panel is rendered");
  return asHost(panel);
}

function menus(): Probe[] {
  const found: unknown[] = screen.UNSAFE_root.findAll(
    (node: Probe) =>
      typeof node.type === "string" && node.props.accessibilityRole === "menu",
  );
  return found.map(asHost);
}

function menu(): Probe {
  return menus()[0] ?? layoutHost();
}

function escapeHost(): unknown {
  return screen.UNSAFE_root.find(
    (node: Probe) =>
      typeof node.type === "string" &&
      typeof node.props.onAccessibilityEscape === "function",
  );
}

function placeAt(find: () => Probe) {
  fireEvent(find(), "layout", PANEL_LAYOUT);
  const { left, position, top } = styleOf(find());
  return { left, position, top };
}

function scrims(): Probe[] {
  const views: unknown[] = screen.UNSAFE_queryAllByType(View);
  return views.map(asHost).filter((node) => styleOf(node).opacity === 0.8);
}

function tooltipTrigger(): unknown {
  return screen.getByRole("button", { name: "Show help" });
}

function checkMark(): unknown {
  return screen.getByText("✓", { includeHiddenElements: true });
}

function menuRow(name: string): Probe {
  return asHost(screen.getByRole("menuitem", { name }));
}

function expectChecked(name: string, checked: boolean) {
  const row = expect(screen.getByRole("radio", { name }));
  if (checked) row.toBeChecked();
  else row.not.toBeChecked();
}

describe("modal on dialog, sheet, drawer, popover and dropdown menu", () => {
  it.each(OVERLAYS)(
    "$name is a host Modal that hides the page by default",
    ({ build }) => {
      render(build({ open: true }));
      expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);
      expect(
        screen.UNSAFE_queryAllByProps({ accessibilityViewIsModal: true }),
      ).not.toHaveLength(0);
    },
  );

  it.each(OVERLAYS)(
    "$name with modal=false draws in place and leaves the page usable",
    ({ build }) => {
      const onPage = jest.fn();
      backHandlerSpy();
      render(
        <>
          <Pressable
            accessibilityLabel="Page action"
            accessibilityRole="button"
            onPress={onPage}
          >
            <Text>Page</Text>
          </Pressable>
          {build({ modal: false, open: true })}
        </>,
      );
      expect(screen.UNSAFE_queryByType(Modal)).toBeNull();
      expect(screen.getByRole("header", { name: "Overlay" })).toBeOnTheScreen();
      expect(
        screen.UNSAFE_queryAllByProps({ accessibilityViewIsModal: true }),
      ).toHaveLength(0);
      fireEvent.press(screen.getByRole("button", { name: "Page action" }));
      expect(onPage).toHaveBeenCalledTimes(1);
    },
  );

  it.each(OVERLAYS)(
    "$name with modal=false closes on Android back and removes the listener",
    ({ build }) => {
      const { add, pressBack, remove } = backHandlerSpy();
      const onOpenChange = jest.fn();
      const onRequestClose = jest.fn();
      const props = { modal: false, onOpenChange, onRequestClose };
      const view = render(build({ ...props, open: true }));
      expect(add).toHaveBeenCalledWith(
        "hardwareBackPress",
        expect.any(Function),
      );
      pressBack();
      expect(onRequestClose).toHaveBeenCalledWith("requestClose");
      expect(onOpenChange).toHaveBeenCalledWith(false);
      view.rerender(build({ ...props, open: false }));
      expect(remove).toHaveBeenCalled();
      expect(screen.queryByRole("header", { name: "Overlay" })).toBeNull();
    },
  );

  it.each(OVERLAYS)(
    "$name with modal=false removes the back listener on unmount",
    ({ build }) => {
      const { remove } = backHandlerSpy();
      const view = render(build({ modal: false, open: true }));
      expect(remove).not.toHaveBeenCalled();
      view.unmount();
      expect(remove).toHaveBeenCalledTimes(1);
    },
  );

  it.each(OVERLAYS)(
    "$name with modal=false closes on the accessibility escape gesture",
    ({ build }) => {
      backHandlerSpy();
      const onRequestClose = jest.fn();
      render(build({ modal: false, onRequestClose, open: true }));
      fireEvent(escapeHost(), "accessibilityEscape");
      expect(onRequestClose).toHaveBeenCalledWith("accessibilityEscape");
    },
  );

  it.each(OVERLAYS)(
    "$name does not listen for Android back while closed",
    ({ build }) => {
      const { add } = backHandlerSpy();
      render(build({ modal: false, open: false }));
      expect(add).not.toHaveBeenCalled();
    },
  );

  it.each(OVERLAYS)(
    "$name moves screen-reader focus to its title when shown, as it must without a host Modal",
    ({ build, focusesWhenModal }) => {
      backHandlerSpy();
      render(build({ modal: false, open: true }), {
        createNodeMock: hostNode,
      });
      expect(focusSpy).toHaveBeenCalledWith(expect.anything(), "focus");
      focusSpy.mockClear();
      render(build({ modal: true, open: true }), {
        createNodeMock: hostNode,
      });
      expect(focusSpy.mock.calls.length > 0).toBe(focusesWhenModal);
    },
  );
});

describe("Dialog overlay", () => {
  it("dims the page with a decorative, touch-free scrim by default", () => {
    render(<Dialog closeLabel="Close" defaultOpen title="Overlay" />);
    const [scrim, ...rest] = scrims();
    expect(rest).toHaveLength(0);
    expect(scrim?.props.pointerEvents).toBe("none");
    expect(scrim?.props.accessibilityElementsHidden).toBe(true);
    expect(scrim?.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  it('draws no scrim for overlay="none"', () => {
    render(
      <Dialog closeLabel="Close" defaultOpen overlay="none" title="Overlay" />,
    );
    expect(scrims()).toHaveLength(0);
  });

  it("draws no scrim for a non-modal dialog, whatever overlay says", () => {
    backHandlerSpy();
    render(
      <Dialog
        closeLabel="Close"
        defaultOpen
        modal={false}
        overlay="scrim"
        title="Overlay"
      />,
    );
    expect(scrims()).toHaveLength(0);
  });

  it("keeps the close control reachable above the scrim", () => {
    const onOpenChange = jest.fn();
    render(
      <Dialog
        closeLabel="Close"
        defaultOpen
        onOpenChange={onOpenChange}
        title="Overlay"
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

function PopoverHarness(
  props: Partial<PopoverProps> & {
    readonly anchored?: boolean;
    readonly attached?: boolean;
  },
) {
  const { anchored = true, attached = true, ...rest } = props;
  const anchor = useRef<View>(null);
  return (
    <>
      <View ref={attached ? anchor : undefined} />
      <Popover
        cancelLabel="Close"
        defaultOpen
        label="Filters"
        {...rest}
        anchorRef={anchored ? anchor : undefined}
      />
    </>
  );
}

const PLACEMENTS = [
  {
    expected: { left: 40, top: 344 },
    name: "below, centred by default",
    props: {},
  },
  {
    expected: { left: 40, top: 196 },
    name: "above for side=top",
    props: { side: "top" },
  },
  {
    expected: { left: 184, top: 270 },
    name: "beside for side=right",
    props: { side: "right" },
  },
  {
    expected: { left: 112, top: 344 },
    name: "start-aligned and nudged by alignOffset",
    props: { align: "start", alignOffset: 12 },
  },
  {
    expected: { left: 40, top: 360 },
    name: "pushed away by sideOffset",
    props: { sideOffset: 20 },
  },
] as const;

describe("Popover placement", () => {
  it.each(PLACEMENTS)("opens $name", async ({ expected, props }) => {
    mockAnchor();
    render(<PopoverHarness {...props} />);
    await flushMicrotasks();
    expect(placeAt(layoutHost)).toEqual({ ...expected, position: "absolute" });
  });

  it("lays out invisibly until it is measured and sized", async () => {
    mockAnchor();
    render(<PopoverHarness />);
    expect(styleOf(layoutHost()).opacity).toBe(0);
    await flushMicrotasks();
    expect(styleOf(layoutHost()).opacity).toBe(0);
    fireEvent(layoutHost(), "layout", PANEL_LAYOUT);
    expect(styleOf(layoutHost()).opacity).toBeUndefined();
  });

  it("stays centred without an anchorRef", async () => {
    mockAnchor();
    render(<PopoverHarness anchored={false} side="top" />);
    await flushMicrotasks();
    const style = styleOf(layoutHost());
    expect(style.position).toBeUndefined();
    expect(style.opacity).toBeUndefined();
    expect(style.alignSelf).toBe("center");
  });

  it("stays centred when the anchor cannot be measured", async () => {
    render(<PopoverHarness attached={false} side="top" />);
    await flushMicrotasks();
    const style = styleOf(layoutHost());
    expect(style.position).toBeUndefined();
    expect(style.alignSelf).toBe("center");
  });

  it("measures again every time it opens", async () => {
    const measureInWindow = mockAnchor();
    const view = render(<PopoverHarness open />);
    await flushMicrotasks();
    expect(measureInWindow).toHaveBeenCalledTimes(1);
    view.rerender(<PopoverHarness open={false} />);
    view.rerender(<PopoverHarness open />);
    await flushMicrotasks();
    expect(measureInWindow).toHaveBeenCalledTimes(2);
  });

  it("does not measure while closed", async () => {
    const measureInWindow = mockAnchor();
    render(<PopoverHarness defaultOpen={false} />);
    await flushMicrotasks();
    expect(measureInWindow).not.toHaveBeenCalled();
  });

  it("keeps an 8 pt margin when the anchor sits at the window edge", async () => {
    mockAnchor({ height: 40, width: 80, x: 0, y: 0 });
    render(<PopoverHarness side="top" />);
    await flushMicrotasks();
    expect(placeAt(layoutHost)).toMatchObject({ left: 8, top: 8 });
  });

  it("ignores a measurement that lands after it closed", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    mockAnchor();
    const view = render(<PopoverHarness open />);
    view.rerender(<PopoverHarness open={false} />);
    await flushMicrotasks();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});

function MenuHarness(
  props: Partial<DropdownMenuProps> & { readonly attached?: boolean },
) {
  const { attached = true, ...rest } = props;
  const anchor = useRef<View>(null);
  return (
    <>
      <View ref={attached ? anchor : undefined} />
      <DropdownMenu
        anchorRef={anchor}
        cancelLabel="Close"
        defaultOpen
        items={[{ id: "a", label: "A" }]}
        label="Actions"
        {...rest}
      />
    </>
  );
}

describe("DropdownMenu placement", () => {
  it.each(PLACEMENTS)("opens $name", async ({ expected, props }) => {
    mockAnchor();
    render(<MenuHarness {...props} />);
    await flushMicrotasks();
    expect(placeAt(menu)).toEqual({ ...expected, position: "absolute" });
    expect(styleOf(menu()).minWidth).toBe(192);
  });

  it("keeps its full-width centred layout without a measurable anchor", async () => {
    render(<MenuHarness attached={false} />);
    await flushMicrotasks();
    const style = styleOf(menus()[0]);
    expect(style.position).toBeUndefined();
    expect(style.width).toBe("92%");
  });
});

function TooltipHarness(props: Partial<TooltipProps>) {
  return (
    <Tooltip
      closeLabel="Close help"
      helpHint="Opens help"
      label="Help"
      trigger="?"
      triggerLabel="Show help"
      {...props}
    >
      Use your work email.
    </Tooltip>
  );
}

describe("Tooltip placement", () => {
  it("opens above its trigger by default", async () => {
    mockAnchor();
    render(<TooltipHarness defaultOpen />);
    await flushMicrotasks();
    expect(placeAt(layoutHost)).toEqual({
      left: 40,
      position: "absolute",
      top: 196,
    });
  });

  it.each(PLACEMENTS)(
    "opens $name when side is given",
    async ({ expected, props }) => {
      mockAnchor();
      render(<TooltipHarness defaultOpen side="bottom" {...props} />);
      await flushMicrotasks();
      expect(placeAt(layoutHost)).toEqual({
        ...expected,
        position: "absolute",
      });
    },
  );

  it("stays invisible while the trigger measurement is outstanding", async () => {
    render(<TooltipHarness defaultOpen />);
    await flushMicrotasks();
    fireEvent(layoutHost(), "layout", PANEL_LAYOUT);
    expect(styleOf(layoutHost()).opacity).toBe(0);
  });
});

describe("Tooltip delayDuration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("opens on press at once by default", () => {
    render(<TooltipHarness />);
    fireEvent.press(tooltipTrigger());
    expect(screen.getByText("Use your work email.")).toBeOnTheScreen();
  });

  it("opens only after the delay, and announces it through onOpenChange", () => {
    const onOpenChange = jest.fn();
    render(<TooltipHarness delayDuration={700} onOpenChange={onOpenChange} />);
    fireEvent.press(tooltipTrigger());
    advanceTimers(699);
    expect(screen.queryByText("Use your work email.")).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    advanceTimers(1);
    expect(screen.getByText("Use your work email.")).toBeOnTheScreen();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("cancels a pending open when the trigger is pressed again", () => {
    const onOpenChange = jest.fn();
    render(<TooltipHarness delayDuration={700} onOpenChange={onOpenChange} />);
    fireEvent.press(tooltipTrigger());
    advanceTimers(300);
    fireEvent.press(tooltipTrigger());
    advanceTimers(2000);
    expect(screen.queryByText("Use your work email.")).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes an open tooltip on the next press without waiting", () => {
    render(<TooltipHarness delayDuration={700} />);
    fireEvent.press(tooltipTrigger());
    advanceTimers(700);
    fireEvent.press(tooltipTrigger());
    expect(screen.queryByText("Use your work email.")).toBeNull();
  });

  it("drops a pending open when it unmounts", () => {
    const onOpenChange = jest.fn();
    const view = render(
      <TooltipHarness delayDuration={700} onOpenChange={onOpenChange} />,
    );
    fireEvent.press(tooltipTrigger());
    view.unmount();
    advanceTimers(2000);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("treats a negative delay as no delay", () => {
    render(<TooltipHarness delayDuration={-5} />);
    fireEvent.press(tooltipTrigger());
    expect(screen.getByText("Use your work email.")).toBeOnTheScreen();
  });
});

const selectLabels = {
  close: "Close list",
  open: "Choose status",
  options: "Status",
  placeholder: "No status",
};
const selectOptions = [
  { id: "draft", label: "Draft" },
  { id: "ready", label: "Ready" },
];

function selectWith(props: Partial<Parameters<typeof Select>[0]> = {}) {
  return (
    <Select
      labels={selectLabels}
      options={selectOptions}
      selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      {...props}
    />
  );
}

describe("Select open, defaultOpen and required", () => {
  it("starts with the list open for defaultOpen", () => {
    render(selectWith({ defaultOpen: true }));
    expect(screen.getByRole("header", { name: "Status" })).toBeOnTheScreen();
  });

  it("starts closed by default", () => {
    render(selectWith());
    expect(screen.queryByRole("header", { name: "Status" })).toBeNull();
  });

  it("closes a defaultOpen list when an option is chosen", () => {
    const onOpenChange = jest.fn();
    render(selectWith({ defaultOpen: true, onOpenChange }));
    fireEvent.press(screen.getByRole("radio", { name: "Ready" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("header", { name: "Status" })).toBeNull();
  });

  it("follows a controlled open prop and reports requests through onOpenChange", () => {
    const onOpenChange = jest.fn();
    const view = render(selectWith({ onOpenChange, open: false }));
    fireEvent.press(screen.getByRole("button", { name: "Choose status" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("header", { name: "Status" })).toBeNull();
    view.rerender(selectWith({ onOpenChange, open: true }));
    expect(screen.getByRole("header", { name: "Status" })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close list" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("header", { name: "Status" })).toBeOnTheScreen();
  });

  it("lets a controlled open win over defaultOpen", () => {
    render(selectWith({ defaultOpen: true, open: false }));
    expect(screen.queryByRole("header", { name: "Status" })).toBeNull();
  });

  it("closes through the Modal request when controlled", () => {
    const onOpenChange = jest.fn();
    render(selectWith({ onOpenChange, open: true }));
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose", {
      nativeEvent: {},
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("speaks Required with the trigger hint", () => {
    render(selectWith({ required: true }));
    expect(
      screen.getByRole("button", { name: "Choose status" }).props
        .accessibilityHint,
    ).toBe("Required");
  });

  it("uses the translated requiredLabel", () => {
    render(selectWith({ required: true, requiredLabel: "Obligatoire" }));
    expect(
      screen.getByRole("button", { name: "Choose status" }).props
        .accessibilityHint,
    ).toBe("Obligatoire");
  });

  it("speaks the error before Required", () => {
    render(
      selectWith({ errorText: "Pick one", invalid: true, required: true }),
    );
    expect(
      screen.getByRole("button", { name: "Choose status" }).props
        .accessibilityHint,
    ).toBe("Pick one. Required");
  });

  it("has no hint when it is neither required nor invalid", () => {
    render(selectWith({ requiredLabel: "Obligatoire" }));
    expect(
      screen.getByRole("button", { name: "Choose status" }).props
        .accessibilityHint,
    ).toBeUndefined();
  });
});

function MenuState(props: { readonly items: readonly DropdownMenuItem[] }) {
  return (
    <DropdownMenu cancelLabel="Close" defaultOpen label="Actions" {...props} />
  );
}

const checkboxItems = (checked?: boolean, extra = {}) =>
  [
    { checked, id: "grid", kind: "checkbox", label: "Show grid", ...extra },
  ] as const;

const radioItems = (value?: string, extra = {}) =>
  [
    {
      id: "view",
      items: [
        { id: "list", label: "List" },
        { id: "cards", label: "Cards" },
        { disabled: true, id: "table", label: "Table" },
      ],
      kind: "radio-group",
      label: "View",
      value,
      ...extra,
    },
  ] as const;

const subItems = (extra = {}): readonly DropdownMenuItem[] => [
  {
    id: "share",
    items: [
      { id: "email", label: "Email" },
      { id: "link", label: "Copy link" },
    ],
    kind: "sub",
    label: "Share",
    ...extra,
  },
];

describe("DropdownMenu checkbox items", () => {
  it("exposes the checked state to screen readers", () => {
    render(<MenuState items={checkboxItems(true)} />);
    const row = screen.getByRole("checkbox", { name: "Show grid" });
    expect(row.props.accessibilityState).toMatchObject({ checked: true });
  });

  it("is unchecked when checked is left out", () => {
    render(<MenuState items={checkboxItems()} />);
    expect(
      screen.getByRole("checkbox", { name: "Show grid" }).props
        .accessibilityState,
    ).toMatchObject({ checked: false });
  });

  it("reports the flipped value and leaves the owner in charge of it", () => {
    const onCheckedChange = jest.fn();
    render(<MenuState items={checkboxItems(false, { onCheckedChange })} />);
    fireEvent.press(screen.getByRole("checkbox", { name: "Show grid" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reports unchecking for a checked row", () => {
    const onCheckedChange = jest.fn();
    render(<MenuState items={checkboxItems(true, { onCheckedChange })} />);
    fireEvent.press(screen.getByRole("checkbox", { name: "Show grid" }));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("closes the menu and calls onSelect without selecting the row", () => {
    const onSelect = jest.fn();
    const onOpenChange = jest.fn();
    render(
      <DropdownMenu
        cancelLabel="Close"
        defaultOpen
        items={[...checkboxItems(false), { id: "copy", label: "Copy" }]}
        label="Actions"
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        selectedId="copy"
      />,
    );
    fireEvent.press(screen.getByRole("checkbox", { name: "Show grid" }));
    expect(onSelect).toHaveBeenCalledWith("grid");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does nothing for a disabled row", () => {
    const onCheckedChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <DropdownMenu
        cancelLabel="Close"
        defaultOpen
        items={checkboxItems(false, { disabled: true, onCheckedChange })}
        label="Actions"
        onSelect={onSelect}
      />,
    );
    const row = screen.getByRole("checkbox", { name: "Show grid" });
    expect(row.props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(row);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("always lays out the check mark, shows it when checked, and hides it from screen readers", () => {
    const view = render(<MenuState items={checkboxItems(false)} />);
    expect(styleOf(checkMark()).opacity).toBe(0);
    view.rerender(<MenuState items={checkboxItems(true)} />);
    expect(styleOf(checkMark()).opacity).toBe(1);
    expect(checkMark()).toHaveProp("accessibilityElementsHidden", true);
  });
});

describe("DropdownMenu radio groups", () => {
  it("checks the row whose id matches value, and only that one", () => {
    render(<MenuState items={radioItems("cards")} />);
    expectChecked("Cards", true);
    expectChecked("List", false);
  });

  it("checks nothing when value is unset or unknown", () => {
    const view = render(<MenuState items={radioItems()} />);
    expect(
      screen
        .getAllByRole("radio")
        .every((radio) => radio.props.accessibilityState.checked === false),
    ).toBe(true);
    view.rerender(<MenuState items={radioItems("missing")} />);
    expect(
      screen
        .getAllByRole("radio")
        .every((radio) => radio.props.accessibilityState.checked === false),
    ).toBe(true);
  });

  it("reports the chosen value, calls onSelect and closes the menu", () => {
    const onValueChange = jest.fn();
    const onSelect = jest.fn();
    const onOpenChange = jest.fn();
    render(
      <DropdownMenu
        cancelLabel="Close"
        defaultOpen
        items={radioItems("list", { onValueChange })}
        label="Actions"
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(screen.getByRole("radio", { name: "Cards" }));
    expect(onValueChange).toHaveBeenCalledWith("cards");
    expect(onSelect).toHaveBeenCalledWith("cards");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not choose a disabled radio", () => {
    const onValueChange = jest.fn();
    render(<MenuState items={radioItems("list", { onValueChange })} />);
    fireEvent.press(screen.getByRole("radio", { name: "Table" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("titles the group with a header and leaves it out without a label", () => {
    const view = render(<MenuState items={radioItems("list")} />);
    expect(screen.getByRole("header", { name: "View" })).toBeOnTheScreen();
    view.rerender(
      <MenuState items={radioItems("list", { label: undefined })} />,
    );
    expect(screen.queryByRole("header", { name: "View" })).toBeNull();
  });
});

describe("DropdownMenu sub-menus", () => {
  it("is collapsed by default and says so", () => {
    render(<MenuState items={subItems()} />);
    expect(menuRow("Share")).toBeCollapsed();
    expect(screen.queryByRole("menuitem", { name: "Email" })).toBeNull();
  });

  it("expands and collapses in place, tracking expanded", () => {
    render(<MenuState items={subItems()} />);
    fireEvent.press(menuRow("Share"));
    expect(menuRow("Share")).toBeExpanded();
    expect(screen.getByRole("menuitem", { name: "Email" })).toBeOnTheScreen();
    expect(menus()).toHaveLength(2);
    fireEvent.press(menuRow("Share"));
    expect(menuRow("Share")).toBeCollapsed();
    expect(screen.queryByRole("menuitem", { name: "Email" })).toBeNull();
  });

  it("starts open for defaultOpen", () => {
    render(<MenuState items={subItems({ defaultOpen: true })} />);
    expect(screen.getByRole("menuitem", { name: "Email" })).toBeOnTheScreen();
  });

  it("follows a controlled open and reports presses through onOpenChange", () => {
    const onOpenChange = jest.fn();
    const view = render(
      <MenuState items={subItems({ onOpenChange, open: false })} />,
    );
    fireEvent.press(menuRow("Share"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("menuitem", { name: "Email" })).toBeNull();
    view.rerender(<MenuState items={subItems({ onOpenChange, open: true })} />);
    expect(screen.getByRole("menuitem", { name: "Email" })).toBeOnTheScreen();
    fireEvent.press(menuRow("Share"));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("menuitem", { name: "Email" })).toBeOnTheScreen();
  });

  it("selects a nested item and closes the whole menu", () => {
    const onSelect = jest.fn();
    const onOpenChange = jest.fn();
    render(
      <DropdownMenu
        cancelLabel="Close"
        defaultOpen
        items={subItems({ defaultOpen: true })}
        label="Actions"
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(screen.getByRole("menuitem", { name: "Copy link" }));
    expect(onSelect).toHaveBeenCalledWith("link");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("never reports the sub-menu row itself as selected", () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu
        cancelLabel="Close"
        defaultOpen
        items={subItems()}
        label="Actions"
        onSelect={onSelect}
      />,
    );
    fireEvent.press(menuRow("Share"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not open a disabled sub-menu", () => {
    render(<MenuState items={subItems({ disabled: true })} />);
    expect(menuRow("Share").props.accessibilityState).toMatchObject({
      disabled: true,
      expanded: false,
    });
    fireEvent.press(menuRow("Share"));
    expect(screen.queryByRole("menuitem", { name: "Email" })).toBeNull();
  });

  it("nests sub-menus, checkboxes and radio groups to any depth", () => {
    const onCheckedChange = jest.fn();
    render(
      <MenuState
        items={[
          {
            defaultOpen: true,
            id: "outer",
            items: [
              {
                defaultOpen: true,
                id: "inner",
                items: [
                  {
                    checked: true,
                    id: "deep-box",
                    kind: "checkbox",
                    label: "Deep box",
                    onCheckedChange,
                  },
                  {
                    id: "deep-group",
                    items: [{ id: "one", label: "One" }],
                    kind: "radio-group",
                    value: "one",
                  },
                ],
                kind: "sub",
                label: "Inner",
              },
            ],
            kind: "sub",
            label: "Outer",
          },
        ]}
      />,
    );
    expect(screen.getByRole("radio", { name: "One" })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("checkbox", { name: "Deep box" }));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("forgets which sub-menus were open once the menu closes", () => {
    const view = render(<MenuState items={subItems()} />);
    fireEvent.press(menuRow("Share"));
    view.rerender(<MenuState items={subItems()} />);
    expect(screen.getByRole("menuitem", { name: "Email" })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("menuitem", { name: "Share" })).toBeNull();
  });
});

describe("DropdownMenu inset", () => {
  it("lines an inset action label up with checkbox and radio rows", () => {
    render(
      <MenuState
        items={[
          { id: "plain", label: "Plain" },
          { id: "inset", inset: true, label: "Indented" },
        ]}
      />,
    );
    const plain = styleOf(screen.getByRole("menuitem", { name: "Plain" }));
    const inset = styleOf(screen.getByRole("menuitem", { name: "Indented" }));
    expect(inset.paddingLeft).toBe(32);
    expect(plain.paddingLeft).not.toBe(32);
  });
});
