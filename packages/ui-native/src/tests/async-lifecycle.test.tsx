import { act, fireEvent, render, screen } from "@testing-library/react-native";

import {
  SearchDialog,
  type SearchDialogLabels,
  type SearchItem,
} from "../components/search-dialog/search-dialog";
import { ShareDialog } from "../components/share-dialog/share-dialog";
import { ShareSection } from "../components/share-section/share-section";
import { Terminal } from "../components/terminal/terminal";
import { Toast, type ToastItem } from "../components/toast/toast";
import type { ShareResult } from "../primitives/platform-services";

function ignoreSettlement() {}

function deferredClipboard() {
  let resolve: () => void = ignoreSettlement;
  let reject: (error: unknown) => void = ignoreSettlement;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function deferred<T>() {
  let resolve: (value: T) => void = ignoreSettlement;
  let reject: (error: unknown) => void = ignoreSettlement;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

const searchLabels: SearchDialogLabels = {
  clear: "Clear",
  close: "Close",
  componentsGroup: "Components",
  docsEmpty: "No docs",
  docsGroup: "Docs",
  empty: "No results",
  minimumDocsQuery: (minimum) => `Type ${minimum}`,
  open: "Open search",
  result: (item) => item.title,
  scope: "Scope",
  scopeOption: {
    components: "Components only",
    docs: "Docs only",
    everything: "Everything",
  },
  searchingDocs: "Searching docs",
  searchPlaceholder: "Search",
  title: "Search docs",
};
const dialogProps = {
  cancelLabel: "Cancel",
  content: { message: "Native UI" },
  shareLabel: "Share now",
  title: "Share",
  unavailableLabel: "Unavailable",
};
const sectionProps = {
  content: dialogProps.content,
  labels: { share: "Share now", unavailable: "Unavailable" },
  title: "Share",
};
const terminalProps = {
  copyLabels: {
    copied: "Copied",
    copy: "Copy commands",
    unavailable: "Unavailable",
  },
  title: "Terminal",
};

function pressTwice(name: string) {
  const button = screen.getByRole("button", { name });
  act(() => {
    fireEvent.press(button);
    fireEvent.press(button);
  });
}

describe("S–Z async lifecycle regressions", () => {
  it("hides cached docs immediately when the search service changes", async () => {
    const first = jest.fn(async () => [{ id: "old", title: "Old docs" }]);
    const next = deferred<readonly SearchItem[]>();
    const second = jest.fn(() => next.promise);
    const props = {
      defaultOpen: true,
      defaultScope: "docs",
      items: [],
      labels: searchLabels,
      onSelect: jest.fn(),
      query: "native",
    } satisfies React.ComponentProps<typeof SearchDialog>;
    render(<SearchDialog {...props} docsSearch={first} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText("Old docs")).toBeOnTheScreen();
    screen.rerender(<SearchDialog {...props} docsSearch={second} />);
    expect(screen.queryByText("Old docs")).toBeNull();
    expect(screen.getByText("Searching docs")).toBeOnTheScreen();
    await act(async () => {
      next.resolve([{ id: "new", title: "New docs" }]);
    });
    expect(screen.getByText("New docs")).toBeOnTheScreen();
  });

  it("ignores a docs request from an earlier open session", async () => {
    const old = deferred<readonly SearchItem[]>();
    const current = deferred<readonly SearchItem[]>();
    const documentationSearch = jest
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(current.promise);
    const props = {
      defaultScope: "docs",
      docsSearch: documentationSearch,
      items: [],
      labels: searchLabels,
      onSelect: jest.fn(),
      query: "native",
    } satisfies React.ComponentProps<typeof SearchDialog>;
    render(<SearchDialog {...props} open />);
    screen.rerender(<SearchDialog {...props} open={false} />);
    screen.rerender(<SearchDialog {...props} open />);
    await act(async () => {
      old.resolve([{ id: "old", title: "Old docs" }]);
    });
    expect(screen.queryByText("Old docs")).toBeNull();
    await act(async () => {
      current.resolve([{ id: "new", title: "New docs" }]);
    });
    expect(screen.getByText("New docs")).toBeOnTheScreen();
  });

  it("settles an unmounted search request without affecting a new instance", async () => {
    const pending = deferred<readonly SearchItem[]>();
    const props = {
      defaultOpen: true,
      defaultScope: "docs",
      items: [],
      labels: searchLabels,
      onSelect: jest.fn(),
      query: "native",
    } satisfies React.ComponentProps<typeof SearchDialog>;
    render(<SearchDialog {...props} docsSearch={() => pending.promise} />);
    screen.unmount();
    render(
      <SearchDialog
        {...props}
        docsSearch={async () => [{ id: "new", title: "New docs" }]}
      />,
    );
    await act(async () => {
      pending.reject(new Error("Old failure"));
    });
    expect(screen.getByText("New docs")).toBeOnTheScreen();
  });

  it("serializes same-render share-dialog presses and exposes busy state", async () => {
    const pending = deferred<ShareResult>();
    const share = jest.fn(() => pending.promise);
    const onShareResult = jest.fn();
    render(
      <ShareDialog
        {...dialogProps}
        defaultOpen
        onShareResult={onShareResult}
        shareService={{ share }}
      />,
    );
    pressTwice("Share now");
    expect(share).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Share now" })).toHaveProp(
      "accessibilityState",
      { busy: true, disabled: true },
    );
    await act(async () => {
      pending.resolve({ status: "shared" });
    });
    expect(onShareResult).toHaveBeenCalledTimes(1);
  });

  it.each(["resolve", "reject"])(
    "ignores late share-dialog %s after close and reopen",
    async (outcome) => {
      const pending = deferred<ShareResult>();
      const shareService = { share: jest.fn(() => pending.promise) };
      const onOpenChange = jest.fn();
      const onShareResult = jest.fn();
      const onShareError = jest.fn();
      const props = {
        ...dialogProps,
        onOpenChange,
        onShareError,
        onShareResult,
        shareService,
      };
      render(<ShareDialog {...props} open />);
      fireEvent.press(screen.getByRole("button", { name: "Share now" }));
      screen.rerender(<ShareDialog {...props} open={false} />);
      screen.rerender(<ShareDialog {...props} open />);
      await act(async () => {
        if (outcome === "resolve") pending.resolve({ status: "shared" });
        else pending.reject(new Error("Old failure"));
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(onShareResult).not.toHaveBeenCalled();
      expect(onShareError).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "Share now" }),
      ).not.toBeDisabled();
    },
  );

  it("serializes same-render share-section presses", async () => {
    const pending = deferred<ShareResult>();
    const share = jest.fn(() => pending.promise);
    const onShareResult = jest.fn();
    render(
      <ShareSection
        {...sectionProps}
        onShareResult={onShareResult}
        shareService={{ share }}
      />,
    );
    pressTwice("Share now");
    expect(share).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve({ status: "dismissed" });
    });
    expect(onShareResult).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Share now" }),
    ).not.toBeDisabled();
  });

  it.each(["dialog", "section"])(
    "suppresses share %s callbacks after unmount",
    async (kind) => {
      const pending = deferred<ShareResult>();
      const shareService = { share: jest.fn(() => pending.promise) };
      const onShareResult = jest.fn();
      const props = { onShareResult, shareService };
      render(
        kind === "dialog" ? (
          <ShareDialog {...dialogProps} {...props} defaultOpen />
        ) : (
          <ShareSection {...sectionProps} {...props} />
        ),
      );
      fireEvent.press(screen.getByRole("button", { name: "Share now" }));
      screen.unmount();
      await act(async () => {
        pending.resolve({ status: "shared" });
      });
      expect(onShareResult).not.toHaveBeenCalled();
    },
  );

  it("recovers share-section pending state after a service failure", async () => {
    const pending = deferred<ShareResult>();
    const onShareError = jest.fn();
    render(
      <ShareSection
        {...sectionProps}
        onShareError={onShareError}
        shareService={{ share: () => pending.promise }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Share now" }));
    const error = new Error("Share failed");
    await act(async () => {
      pending.reject(error);
    });
    expect(onShareError).toHaveBeenCalledWith(error);
    expect(
      screen.getByRole("button", { name: "Share now" }),
    ).not.toBeDisabled();
  });

  it("serializes terminal copying and reports one success", async () => {
    const pending = deferredClipboard();
    const setText = jest.fn(() => pending.promise);
    const onCopySuccess = jest.fn();
    render(
      <Terminal
        {...terminalProps}
        clipboard={{ getText: async () => "", setText }}
        lines={[{ content: "pnpm test", type: "command" }]}
        onCopySuccess={onCopySuccess}
      />,
    );
    pressTwice("Copy commands");
    expect(setText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copy commands" })).toHaveProp(
      "accessibilityState",
      { busy: true, disabled: true },
    );
    await act(async () => {
      pending.resolve();
    });
    expect(onCopySuccess).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copied" })).not.toBeDisabled();
  });

  it("ignores terminal failure after adapter replacement and permits retry", async () => {
    const pending = deferred<undefined>();
    const onCopyError = jest.fn();
    const props = {
      ...terminalProps,
      lines: [{ content: "pnpm test", type: "command" }],
      onCopyError,
    } satisfies React.ComponentProps<typeof Terminal>;
    render(
      <Terminal
        {...props}
        clipboard={{ getText: async () => "", setText: () => pending.promise }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Copy commands" }));
    const setText = jest.fn(async () => {});
    screen.rerender(
      <Terminal {...props} clipboard={{ getText: async () => "", setText }} />,
    );
    expect(
      screen.getByRole("button", { name: "Copy commands" }),
    ).toBeDisabled();
    await act(async () => {
      pending.reject(new Error("Old failure"));
    });
    expect(onCopyError).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Copy commands" }));
    });
    expect(setText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copied" })).not.toBeDisabled();
  });

  it.each(["commands", "unmount"])(
    "ignores terminal completion after %s changes",
    async (change) => {
      const pending = deferredClipboard();
      const clipboard = {
        getText: async () => "",
        setText: jest.fn(() => pending.promise),
      };
      const onCopySuccess = jest.fn();
      const props = { ...terminalProps, clipboard, onCopySuccess };
      render(
        <Terminal
          {...props}
          lines={[{ content: "pnpm test", type: "command" }]}
        />,
      );
      fireEvent.press(screen.getByRole("button", { name: "Copy commands" }));
      if (change === "unmount") screen.unmount();
      else
        screen.rerender(
          <Terminal
            {...props}
            lines={[{ content: "pnpm lint", type: "command" }]}
          />,
        );
      await act(async () => {
        pending.resolve();
      });
      expect(onCopySuccess).not.toHaveBeenCalled();
      if (change === "commands")
        expect(
          screen.getByRole("button", { name: "Copy commands" }),
        ).not.toBeDisabled();
    },
  );
});

describe("S–Z controlled toast timer regressions", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([undefined, 0])(
    "cancels an existing timer when duration changes to %s",
    (duration) => {
      const onToastsChange = jest.fn();
      render(
        <Toast
          closeLabel="Close"
          onToastsChange={onToastsChange}
          toasts={[{ duration: 100, id: "a", title: "A" }]}
        />,
      );
      act(() => {
        jest.advanceTimersByTime(50);
      });
      screen.rerender(
        <Toast
          closeLabel="Close"
          onToastsChange={onToastsChange}
          toasts={[{ duration, id: "a", title: "A" }]}
        />,
      );
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onToastsChange).not.toHaveBeenCalled();
    },
  );

  it("restarts a changed positive duration but preserves unchanged deadlines", () => {
    const onToastsChange = jest.fn();
    const item = { duration: 100, id: "a", title: "A" };
    render(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={[item]}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(50);
    });
    screen.rerender(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={[{ ...item, duration: 200 }]}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onToastsChange).not.toHaveBeenCalled();
    screen.rerender(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={[{ ...item, duration: 200, title: "Updated" }]}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onToastsChange).toHaveBeenCalledTimes(1);
    expect(onToastsChange).toHaveBeenLastCalledWith([]);
  });

  it("accumulates simultaneous expiries before the controlled owner renders", () => {
    const onToastsChange = jest.fn();
    const toasts: readonly ToastItem[] = [
      { duration: 100, id: "a", title: "A" },
      { duration: 100, id: "b", title: "B" },
    ];
    render(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={toasts}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onToastsChange.mock.calls).toEqual([[toasts.slice(1)], [[]]]);
  });

  it("accumulates manual dismissals and does not restart them on an intermediate controlled update", () => {
    const onToastsChange = jest.fn();
    const toasts: readonly ToastItem[] = [
      { duration: 100, id: "a", title: "A" },
      { duration: 100, id: "b", title: "B" },
    ];
    render(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={toasts}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: "Close" });
    act(() => {
      for (const button of buttons) fireEvent.press(button);
    });
    expect(onToastsChange).toHaveBeenLastCalledWith([]);
    screen.rerender(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={toasts.slice(1)}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onToastsChange).toHaveBeenCalledTimes(2);
    screen.rerender(
      <Toast closeLabel="Close" onToastsChange={onToastsChange} toasts={[]} />,
    );
    screen.rerender(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={toasts.slice(1)}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onToastsChange).toHaveBeenCalledTimes(3);
    expect(onToastsChange).toHaveBeenLastCalledWith([]);
  });

  it("clears timers on unmount", () => {
    const onToastsChange = jest.fn();
    render(
      <Toast
        closeLabel="Close"
        onToastsChange={onToastsChange}
        toasts={[{ duration: 100, id: "a", title: "A" }]}
      />,
    );
    screen.unmount();
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onToastsChange).not.toHaveBeenCalled();
  });
});
