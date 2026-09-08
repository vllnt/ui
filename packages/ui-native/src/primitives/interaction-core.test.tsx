import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Modal, Pressable, Text } from "react-native";

import { ModalLayer } from "./modal-layer";
import {
  type ClipboardService,
  createPlatformServices,
  defaultLinkingService,
  defaultShareService,
  type FilePickerService,
  type LinkingService,
  type ShareService,
} from "./platform-services";
import {
  isMultipleSelected,
  isSingleSelected,
  selectSingle,
  setMultipleSelected,
  toggleMultipleSelected,
} from "./selection";
import { useControllableState } from "./use-controllable-state";
import {
  type ReducedMotionService,
  useReducedMotion,
} from "./use-reduced-motion";

type StateHarnessProps = {
  readonly defaultValue?: string;
  readonly onChange: (value: string) => void;
  readonly value?: string;
};

type ReducedMotionHarnessProps = {
  readonly service: ReducedMotionService;
};

type SafeAreaProps = {
  readonly children: ReactNode;
};

function StateHarness({ defaultValue, onChange, value }: StateHarnessProps) {
  const [currentValue, setCurrentValue] = useControllableState(
    value === undefined
      ? {
          defaultValue: defaultValue ?? "initial",
          mode: "uncontrolled",
          onChange,
        }
      : { mode: "controlled", onChange, value },
  );

  return (
    <>
      <Text testID="state-value">{currentValue}</Text>
      <Pressable
        onPress={() => {
          setCurrentValue(currentValue);
        }}
        testID="set-same"
      />
      <Pressable
        onPress={() => {
          setCurrentValue("next");
        }}
        testID="set-next"
      />
    </>
  );
}
StateHarness.displayName = "StateHarness";

function ReducedMotionHarness({ service }: ReducedMotionHarnessProps) {
  const reducedMotionEnabled = useReducedMotion(service);
  return <Text>{reducedMotionEnabled ? "reduced" : "full"}</Text>;
}
ReducedMotionHarness.displayName = "ReducedMotionHarness";

function SafeArea({ children }: SafeAreaProps) {
  return (
    <>
      <Text>Safe area</Text>
      {children}
    </>
  );
}
SafeArea.displayName = "SafeArea";

describe("native interaction core", () => {
  it("updates uncontrolled state and notifies only for changes", () => {
    const onChange = jest.fn();
    render(<StateHarness defaultValue="initial" onChange={onChange} />);

    fireEvent.press(screen.getByTestId("set-same"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("set-next"));
    expect(screen.getByTestId("state-value")).toHaveTextContent("next");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("next");

    fireEvent.press(screen.getByTestId("set-next"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("leaves controlled state with its owner and uses the latest callback", () => {
    const firstOnChange = jest.fn();
    const secondOnChange = jest.fn();
    const view = render(
      <StateHarness onChange={firstOnChange} value="controlled" />,
    );

    fireEvent.press(screen.getByTestId("set-same"));
    expect(firstOnChange).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("set-next"));
    expect(firstOnChange).toHaveBeenCalledWith("next");
    expect(screen.getByTestId("state-value")).toHaveTextContent("controlled");

    view.rerender(
      <StateHarness onChange={secondOnChange} value="controlled" />,
    );
    fireEvent.press(screen.getByTestId("set-next"));
    expect(secondOnChange).toHaveBeenCalledWith("next");
  });

  it("uses caller-stable keys for single and multiple selection", () => {
    const first = { id: "first", label: "First" };
    const second = { id: "second", label: "Second" };
    const getKey = (item: typeof first) => item.id;

    expect(isSingleSelected("first", first, getKey)).toBe(true);
    expect(selectSingle("first", first, getKey)).toBe("first");
    expect(selectSingle("first", second, getKey)).toBe("second");

    const selected = new Set(["first"]);
    expect(isMultipleSelected(selected, first, getKey)).toBe(true);
    expect(setMultipleSelected(selected, first, true, getKey)).toBe(selected);

    const added = setMultipleSelected(selected, second, true, getKey);
    expect([...added]).toEqual(["first", "second"]);
    expect([...toggleMultipleSelected(added, first, getKey)]).toEqual([
      "second",
    ]);
    expect([...selected]).toEqual(["first"]);
  });

  it("observes reduced motion and cleans up its subscription", async () => {
    const remove = jest.fn();
    let listener: ((enabled: boolean) => void) | undefined;
    const service: ReducedMotionService = {
      addEventListener: (_eventName, nextListener) => {
        listener = nextListener;
        return { remove };
      },
      isReduceMotionEnabled: async () => false,
    };

    const view = render(<ReducedMotionHarness service={service} />);
    expect(screen.getByText("reduced")).toBeOnTheScreen();
    await waitFor(() => {
      expect(screen.getByText("full")).toBeOnTheScreen();
    });

    act(() => {
      listener?.(true);
    });
    expect(screen.getByText("reduced")).toBeOnTheScreen();

    view.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("keeps a newer reduced-motion event when the initial query resolves late", async () => {
    let resolvePreference: ((enabled: boolean) => void) | undefined;
    let listener: ((enabled: boolean) => void) | undefined;
    const initialPreference = new Promise<boolean>((resolve) => {
      resolvePreference = resolve;
    });
    const service: ReducedMotionService = {
      addEventListener: (_eventName, nextListener) => {
        listener = nextListener;
        return { remove: jest.fn() };
      },
      isReduceMotionEnabled: () => initialPreference,
    };

    render(<ReducedMotionHarness service={service} />);
    act(() => listener?.(true));
    await act(async () => {
      resolvePreference?.(false);
      await initialPreference;
    });

    expect(screen.getByText("reduced")).toBeOnTheScreen();
  });

  it("ignores an old service query after replacing its subscription", async () => {
    let resolvePreference: ((enabled: boolean) => void) | undefined;
    const initialPreference = new Promise<boolean>((resolve) => {
      resolvePreference = resolve;
    });
    const remove = jest.fn();
    const oldService: ReducedMotionService = {
      addEventListener: () => ({ remove }),
      isReduceMotionEnabled: () => initialPreference,
    };
    const nextService: ReducedMotionService = {
      addEventListener: () => ({ remove: jest.fn() }),
      isReduceMotionEnabled: async () => true,
    };

    const view = render(<ReducedMotionHarness service={oldService} />);
    await act(async () => {
      view.rerender(<ReducedMotionHarness service={nextService} />);
    });
    expect(remove).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolvePreference?.(false);
      await initialPreference;
    });

    expect(screen.getByText("reduced")).toBeOnTheScreen();
  });

  it("maps accessibility escape and Android back through native events", () => {
    const onClose = jest.fn();
    render(
      <ModalLayer
        contentProps={{ testID: "modal-content" }}
        onClose={onClose}
        safeArea={(content) => <SafeArea>{content}</SafeArea>}
        visible
      >
        <Text>Modal body</Text>
      </ModalLayer>,
    );

    expect(screen.getByTestId("modal-content")).toHaveProp(
      "accessibilityViewIsModal",
      true,
    );
    expect(screen.getByText("Safe area")).toBeOnTheScreen();
    fireEvent(screen.getByTestId("modal-content"), "accessibilityEscape");
    expect(onClose).toHaveBeenCalledWith("accessibilityEscape");

    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose", {
      nativeEvent: {},
    });
    expect(onClose).toHaveBeenCalledWith("requestClose");
  });

  it("keeps optional services absent and uses available injected adapters", async () => {
    const missingServices = createPlatformServices();
    expect(missingServices.clipboard).toBeUndefined();
    expect(missingServices.filePicker).toBeUndefined();
    expect(missingServices.linking).toBe(defaultLinkingService);
    expect(missingServices.share).toBe(defaultShareService);

    const clipboard: ClipboardService = {
      getText: jest.fn(async () => "copied"),
      setText: jest.fn(() => Promise.resolve()),
    };
    const filePicker: FilePickerService = {
      pickFiles: jest.fn(async () => [
        { name: "notes.txt", uri: "file:///notes.txt" },
      ]),
    };
    const linking: LinkingService = {
      async openUrl() {
        return { status: "opened" };
      },
    };
    const share: ShareService = {
      async share() {
        return { status: "dismissed" };
      },
    };
    const services = createPlatformServices({
      clipboard,
      filePicker,
      linking,
      share,
    });

    expect(services.clipboard).toBe(clipboard);
    expect(services.filePicker).toBe(filePicker);
    expect(services.linking).toBe(linking);
    expect(services.share).toBe(share);
    await expect(clipboard.getText()).resolves.toBe("copied");
    await expect(filePicker.pickFiles()).resolves.toEqual([
      { name: "notes.txt", uri: "file:///notes.txt" },
    ]);
    await expect(
      services.linking.openUrl("https://example.com"),
    ).resolves.toEqual({ status: "opened" });
    await expect(
      services.share.share({ message: "Share me" }),
    ).resolves.toEqual({ status: "dismissed" });
  });
});
