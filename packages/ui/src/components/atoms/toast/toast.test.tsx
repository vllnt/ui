import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { toast as sdkToast } from "@ui-sdk/react/toast";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "./toast";
import { toast } from "./toast-api";
import { Toaster } from "./toaster";

describe("Toast", () => {
  it("renders children", () => {
    render(
      <Toast>
        <span>body</span>
      </Toast>,
    );
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("applies the destructive variant class", () => {
    const { container } = render(<Toast variant="destructive">x</Toast>);
    expect(container.firstChild).toHaveClass("destructive");
  });

  it("merges the className prop", () => {
    const { container } = render(<Toast className="extra">x</Toast>);
    expect(container.firstChild).toHaveClass("extra");
  });
});

describe("ToastTitle + ToastDescription", () => {
  it("renders title and description", () => {
    render(
      <Toast>
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>Run completed.</ToastDescription>
      </Toast>,
    );
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Run completed.")).toBeInTheDocument();
  });
});

describe("ToastClose", () => {
  it("invokes onClick when clicked", () => {
    const handleClose = vi.fn();
    render(<ToastClose onClick={handleClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("emits the data-toast-close attribute for analytics", () => {
    render(<ToastClose />);
    expect(screen.getByRole("button")).toHaveAttribute("data-toast-close");
  });
});

describe("ToastAction", () => {
  it("renders children + invokes onClick", () => {
    const handleRetryAction = vi.fn();
    render(
      <ToastAction altText="retry" onClick={handleRetryAction}>
        Retry
      </ToastAction>,
    );
    fireEvent.click(screen.getByText("Retry"));
    expect(handleRetryAction).toHaveBeenCalledTimes(1);
  });
});

describe("Toast announcements", () => {
  it("announces default toasts politely and destructive toasts as alerts", () => {
    render(
      <>
        <Toast>
          <ToastTitle>Saved</ToastTitle>
        </Toast>
        <Toast variant="destructive">
          <ToastTitle>Payment failed</ToastTitle>
          <ToastDescription>Update your card.</ToastDescription>
        </Toast>
      </>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Saved");
    expect(status).toHaveAttribute("aria-live", "polite");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Payment failed");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("keeps the description at full opacity for contrast", () => {
    render(<ToastDescription>Update your card.</ToastDescription>);
    expect(screen.getByText("Update your card.").className).not.toMatch(
      /opacity-/,
    );
  });
});

describe("toast + Toaster", () => {
  it("shows a toast() message in the mounted Toaster", async () => {
    render(<Toaster theme="light" />);
    act(() => {
      toast("Deployed");
    });
    expect(await screen.findByText("Deployed")).toBeInTheDocument();
  });
});

const noop = (): void => undefined;

const queued = () => sdkToast.toasts();

function queuedById() {
  return Object.fromEntries(queued().map((item) => [item.id, item]));
}

function regionElement() {
  const element = document.querySelector<HTMLElement>(
    '[data-slot="toast-region"]',
  );
  if (!element) {
    throw new Error("Toaster region not found");
  }
  return element;
}

function toastElement(text: string) {
  const element = screen
    .getByText(text)
    .closest<HTMLElement>('[data-slot="toast"]');
  if (!element) {
    throw new Error(`No toast around "${text}"`);
  }
  return element;
}

async function showToast(
  text: string,
  options?: Parameters<typeof toast>[1],
  type:
    | "error"
    | "info"
    | "loading"
    | "message"
    | "success"
    | "warning" = "message",
) {
  act(() => {
    toast[type](text, options);
  });
  await screen.findByText(text);
}

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
});

describe("toast()", () => {
  it("returns the id it was given, or makes one", () => {
    expect(toast("Named", { id: "named" })).toBe("named");
    expect(toast("Numbered", { id: 7 })).toBe(7);
    expect(typeof toast("Anonymous")).toBe("string");
    expect(Object.keys(queuedById())).toEqual(
      expect.arrayContaining(["named", "7"]),
    );
  });

  it("maps each method to a toast type", () => {
    toast("a", { id: "default" });
    toast.message("b", { id: "message" });
    toast.success("c", { id: "success" });
    toast.error("d", { id: "error" });
    toast.info("e", { id: "info" });
    toast.warning("f", { id: "warning" });
    toast.loading("g", { id: "loading" });
    const types = Object.fromEntries(
      Object.entries(queuedById()).map(([id, item]) => [id, item.type]),
    );
    expect(types).toEqual({
      default: "default",
      error: "error",
      info: "info",
      loading: "loading",
      message: "default",
      success: "success",
      warning: "warning",
    });
  });

  it("shows toasts for 4 seconds unless told otherwise, and keeps loading ones", () => {
    toast("Default", { id: "default" });
    toast("Short", { duration: 1000, id: "short" });
    toast("Forever", { duration: Number.POSITIVE_INFINITY, id: "forever" });
    toast.loading("Loading", { duration: 1000, id: "loading" });
    const durations = Object.fromEntries(
      Object.entries(queuedById()).map(([id, item]) => [id, item.duration]),
    );
    expect(durations).toEqual({
      default: 4000,
      forever: Number.POSITIVE_INFINITY,
      loading: Number.POSITIVE_INFINITY,
      short: 1000,
    });
  });

  it("announces errors politely, as sonner did, unless asked to interrupt", () => {
    toast.error("Polite", { id: "polite" });
    toast.error("Urgent", { id: "urgent", priority: "assertive" });
    expect(queuedById().polite?.priority).toBe("polite");
    expect(queuedById().urgent?.priority).toBe("assertive");
  });

  it("updates the toast shown with the same id", () => {
    toast.loading("Saving", { id: "save" });
    toast.success("Saved", { description: "Done", id: "save" });
    expect(queued()).toHaveLength(1);
    expect(queued()[0]).toMatchObject({
      description: "Done",
      duration: 4000,
      title: "Saved",
      type: "success",
    });
  });

  it("calls function titles and descriptions", () => {
    toast(() => "From a function", {
      description: () => "Also from a function",
      id: "fn",
    });
    expect(queued()[0]).toMatchObject({
      description: "Also from a function",
      title: "From a function",
    });
  });

  it("dismisses one toast by id, or all of them", () => {
    toast("One", { id: "one" });
    toast("Two", { id: "two" });
    expect(toast.dismiss("one")).toBe("one");
    expect(queued().map((item) => item.id)).toEqual(["two"]);
    toast.dismiss();
    expect(queued()).toHaveLength(0);
  });

  it("hands a numeric id back to the dismiss callbacks as given", () => {
    const onDismiss = vi.fn();
    toast("Counted", { id: 7, onDismiss });
    toast.dismiss(7);
    expect(onDismiss).toHaveBeenCalledWith({ id: 7 });
  });

  it("calls onDismiss, not onAutoClose, when the toast is dismissed", () => {
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    toast("Bye", { id: "bye", onAutoClose, onDismiss });
    toast.dismiss("bye");
    expect(onDismiss).toHaveBeenCalledWith({ id: "bye" });
    expect(onAutoClose).not.toHaveBeenCalled();
  });
});

describe("Toaster", () => {
  it("shows a toast fired before it mounted", async () => {
    toast("Early", { id: "early" });
    render(<Toaster theme="light" />);
    expect(await screen.findByText("Early")).toBeInTheDocument();
  });

  it("renders the title, description and type icon", async () => {
    render(<Toaster theme="light" />);
    await showToast("Saved", { description: "All good" }, "success");
    const item = toastElement("Saved");
    expect(item).toHaveAttribute("data-type", "success");
    expect(item).toHaveTextContent("All good");
    expect(item.querySelector("svg")).not.toBeNull();
  });

  it("shows no icon on a default toast, and a given icon on any toast", async () => {
    render(<Toaster theme="light" />);
    await showToast("Plain");
    expect(toastElement("Plain").querySelector("svg")).toBeNull();
    await showToast("Custom", { icon: <span data-testid="mine" /> });
    expect(screen.getByTestId("mine")).toBeInTheDocument();
  });

  it("takes icons for each type from the icons prop", async () => {
    render(
      <Toaster
        icons={{ success: <span data-testid="tick" /> }}
        theme="light"
      />,
    );
    await showToast("Saved", undefined, "success");
    expect(screen.getByTestId("tick")).toBeInTheDocument();
  });

  it("places the region by position", async () => {
    const { rerender } = render(<Toaster theme="light" />);
    await showToast("Placed");
    expect(regionElement()).toHaveAttribute("data-side", "bottom");
    expect(regionElement()).toHaveAttribute("data-align", "end");
    rerender(<Toaster position="top-center" theme="light" />);
    await waitFor(() => {
      expect(regionElement()).toHaveAttribute("data-side", "top");
    });
    expect(regionElement()).toHaveAttribute("data-align", "center");
    rerender(<Toaster position="bottom-left" theme="light" />);
    await waitFor(() => {
      expect(regionElement()).toHaveAttribute("data-align", "start");
    });
  });

  it("colors toasts by type with richColors", async () => {
    const { rerender } = render(<Toaster theme="light" />);
    await showToast("Saved", undefined, "success");
    expect(toastElement("Saved").className).not.toContain("--success-bg");
    rerender(<Toaster richColors theme="light" />);
    await waitFor(() => {
      expect(toastElement("Saved").className).toContain(
        "[--toast-bg:var(--success-bg)]",
      );
    });
    expect(toastElement("Saved").className).toContain(
      "![border-color:var(--success-border)]",
    );
  });

  it("follows the theme prop for its palette", async () => {
    const { rerender } = render(<Toaster theme="light" />);
    await showToast("Palette");
    expect(regionElement().style.getPropertyValue("--description")).toBe(
      "#3f3f3f",
    );
    rerender(<Toaster theme="dark" />);
    await waitFor(() => {
      expect(regionElement().style.getPropertyValue("--description")).toBe(
        "#e8e8e8",
      );
    });
  });

  it("takes the page's tokens for its surface", async () => {
    render(<Toaster theme="light" />);
    await showToast("Tokens");
    const style = regionElement().style;
    // The tokens are bare oklch triplets, so each needs the oklch() wrapper.
    expect(style.getPropertyValue("--normal-bg")).toBe("oklch(var(--popover))");
    expect(style.getPropertyValue("--normal-border")).toBe(
      "oklch(var(--border))",
    );
    expect(style.getPropertyValue("--normal-text")).toBe(
      "oklch(var(--popover-foreground))",
    );
    expect(style.getPropertyValue("--border-radius")).toBe("var(--radius)");
  });

  it("merges className and style, and takes an offset and a label", async () => {
    render(
      <Toaster
        className="mine"
        containerAriaLabel="Alerts"
        offset={32}
        style={{ color: "red" }}
        theme="light"
      />,
    );
    await showToast("Styled");
    const element = regionElement();
    expect(element).toHaveClass("mine", "toaster", "group");
    expect(element.style.color).toBe("red");
    expect(element.style.getPropertyValue("--toaster-offset")).toBe("32px");
    expect(element).toHaveAccessibleName("Alerts");
  });

  it("limits how many toasts show with visibleToasts", async () => {
    render(<Toaster theme="light" visibleToasts={2} />);
    await showToast("One", { id: "one" });
    await showToast("Two", { id: "two" });
    act(() => {
      toast("Three", { id: "three" });
    });
    await screen.findByText("Three");
    await waitFor(() => {
      expect(screen.queryByText("One")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("keeps the stack open with expand", async () => {
    const { rerender } = render(<Toaster theme="light" />);
    await showToast("Stacked");
    expect(regionElement()).not.toHaveAttribute("data-expanded");
    rerender(<Toaster expand theme="light" />);
    await waitFor(() => {
      expect(regionElement()).toHaveAttribute("data-expanded");
    });
    expect(toastElement("Stacked")).toHaveAttribute("data-expanded");
  });

  it("applies toastOptions and per-toast class names and styles", async () => {
    render(
      <Toaster
        theme="light"
        toastOptions={{
          className: "every",
          classNames: { title: "every-title", toast: "every-toast" },
          descriptionClassName: "every-description",
          style: { opacity: 0.9 },
        }}
      />,
    );
    await showToast(
      "Classed",
      {
        className: "own",
        classNames: { success: "own-success", title: "own-title" },
        description: "Details",
      },
      "success",
    );
    const item = toastElement("Classed");
    expect(item).toHaveClass("every", "every-toast", "own", "own-success");
    expect(item.style.opacity).toBe("0.9");
    expect(screen.getByText("Classed")).toHaveClass("every-title", "own-title");
    expect(screen.getByText("Details")).toHaveClass("every-description");
  });

  it("sets how long toasts show with duration, then lets go on unmount", () => {
    const { unmount } = render(<Toaster duration={1234} theme="light" />);
    toast("Timed", { id: "timed" });
    expect(queuedById().timed?.duration).toBe(1234);
    unmount();
    toast("Reset", { id: "reset" });
    expect(queuedById().reset?.duration).toBe(4000);
  });

  it("takes the default duration from toastOptions", () => {
    render(<Toaster theme="light" toastOptions={{ duration: 2500 }} />);
    toast("Timed", { id: "timed" });
    expect(queuedById().timed?.duration).toBe(2500);
  });

  it("closes a toast by itself after its duration and reports onAutoClose", async () => {
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    render(<Toaster theme="light" />);
    await showToast("Brief", {
      duration: 30,
      id: "brief",
      onAutoClose,
      onDismiss,
    });
    await waitFor(() => {
      expect(onAutoClose).toHaveBeenCalledWith({ id: "brief" });
    });
    expect(onDismiss).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText("Brief")).not.toBeInTheDocument();
    });
  });
});

describe("Toaster buttons", () => {
  it("shows a labelled close button with closeButton, and closes the toast", async () => {
    const onDismiss = vi.fn();
    render(<Toaster closeButton theme="light" />);
    await showToast("Closable", { id: "closable", onDismiss });
    fireEvent.click(screen.getByRole("button", { name: "Close toast" }));
    await waitFor(() => {
      expect(screen.queryByText("Closable")).not.toBeInTheDocument();
    });
    expect(onDismiss).toHaveBeenCalledWith({ id: "closable" });
  });

  it("lets one toast opt in or out of the close button, and skips loading toasts", async () => {
    render(<Toaster theme="light" />);
    await showToast("Opted in", { closeButton: true });
    expect(
      screen.getByRole("button", { name: "Close toast" }),
    ).toBeInTheDocument();
    await showToast("Busy", { closeButton: true }, "loading");
    expect(screen.getAllByRole("button", { name: "Close toast" })).toHaveLength(
      1,
    );
  });

  it("runs the action's onClick and closes the toast", async () => {
    const onClick = vi.fn();
    render(<Toaster theme="light" />);
    await showToast("Archived", { action: { label: "Undo", onClick } });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    await waitFor(() => {
      expect(screen.queryByText("Archived")).not.toBeInTheDocument();
    });
  });

  it("keeps the toast open when the action prevents the default", async () => {
    render(<Toaster theme="light" />);
    await showToast("Stays", {
      action: {
        label: "Retry",
        onClick: (event) => {
          event.preventDefault();
        },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    });
    expect(screen.getByText("Stays")).toBeInTheDocument();
  });

  it("runs the cancel button's onClick and closes the toast", async () => {
    const onClick = vi.fn();
    render(<Toaster theme="light" />);
    await showToast("Maybe", { cancel: { label: "Never mind", onClick } });
    fireEvent.click(screen.getByRole("button", { name: "Never mind" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByText("Maybe")).not.toBeInTheDocument();
    });
  });
});

describe("toast.promise", () => {
  it("shows loading, then success, and unwraps the result", async () => {
    render(<Toaster theme="light" />);
    let resolve: (value: string) => void = noop;
    const pending = new Promise<string>((done) => {
      resolve = done;
    });
    const handle = toast.promise(pending, {
      description: (value) => `Got ${value}`,
      loading: "Saving",
      success: (value) => `Saved ${value}`,
    });
    expect(await screen.findByText("Saving")).toBeInTheDocument();
    expect(toastElement("Saving")).toHaveAttribute("data-type", "loading");
    resolve("file");
    expect(await screen.findByText("Saved file")).toBeInTheDocument();
    expect(toastElement("Saved file")).toHaveAttribute("data-type", "success");
    expect(screen.getByText("Got file")).toBeInTheDocument();
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();
    await expect(handle.unwrap()).resolves.toBe("file");
    expect(queuedById()[handle.id]?.duration).toBe(4000);
  });

  it("shows the error and rejects unwrap when the promise rejects", async () => {
    render(<Toaster theme="light" />);
    const failure = new Error("nope");
    const handle = toast.promise(() => Promise.reject(failure), {
      error: (reason) => `Failed: ${(reason as Error).message}`,
      loading: "Saving",
    });
    expect(await screen.findByText("Failed: nope")).toBeInTheDocument();
    expect(toastElement("Failed: nope")).toHaveAttribute("data-type", "error");
    await expect(handle.unwrap()).rejects.toBe(failure);
  });

  it("closes the toast when there is no result message, and calls finally", async () => {
    render(<Toaster theme="light" />);
    const done = vi.fn();
    toast.promise(Promise.resolve(1), { finally: done, loading: "Working" });
    await waitFor(() => {
      expect(screen.queryByText("Working")).not.toBeInTheDocument();
    });
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("announces a promise's error politely", async () => {
    render(<Toaster theme="light" />);
    toast.promise(Promise.reject(new Error("x")), {
      error: "Failed",
      loading: "Saving",
    });
    await screen.findByText("Failed");
    expect(queued()[0]).toMatchObject({ priority: "polite", type: "error" });
  });
});

describe("toast.custom", () => {
  it("renders the given content without the toast's chrome", async () => {
    render(<Toaster theme="light" />);
    act(() => {
      toast.custom((id) => <span>Custom {id}</span>, { id: "mine" });
    });
    expect(await screen.findByText("Custom mine")).toBeInTheDocument();
    const item = toastElement("Custom mine");
    expect(item.className).not.toContain("border-[color:");
    expect(item.querySelector("svg")).toBeNull();
  });
});

describe("Toaster accessibility", () => {
  it("is a labelled notifications landmark with a keyboard shortcut", async () => {
    render(<Toaster theme="light" />);
    await showToast("Landmark");
    const landmark = screen.getByRole("region", { name: "Notifications" });
    expect(landmark).toHaveAttribute("aria-keyshortcuts", "Alt+T");
  });

  it("announces toasts politely through a live region", async () => {
    render(<Toaster theme="light" />);
    await showToast("Saved quietly");
    const polite = document.querySelector(
      '[aria-live="polite"][role="status"]',
    );
    await waitFor(() => {
      expect(polite).toHaveTextContent("Saved quietly");
    });
  });

  it("announces errors politely too, and assertively only when asked", async () => {
    render(<Toaster theme="light" />);
    await showToast("Quiet failure", undefined, "error");
    const polite = document.querySelector(
      '[aria-live="polite"][role="status"]',
    );
    const assertive = document.querySelector(
      '[aria-live="assertive"][role="alert"]',
    );
    await waitFor(() => {
      expect(polite).toHaveTextContent("Quiet failure");
    });
    expect(assertive).toBeEmptyDOMElement();
    await showToast("Loud failure", { priority: "assertive" }, "error");
    await waitFor(() => {
      expect(assertive).toHaveTextContent("Loud failure");
    });
  });

  it("names each toast by its title and description and puts it in the tab order", async () => {
    render(<Toaster theme="light" />);
    await showToast("Named toast", { description: "With details" });
    const item = toastElement("Named toast");
    expect(item).toHaveAttribute("tabindex", "0");
    expect(item).toHaveAccessibleName("Named toast");
    expect(item).toHaveAccessibleDescription("With details");
  });

  it("opens the stack while a toast has keyboard focus", async () => {
    render(<Toaster theme="light" />);
    await showToast("Older", { id: "older" });
    await showToast("Newer", { id: "newer" });
    expect(regionElement()).not.toHaveAttribute("data-expanded");
    act(() => {
      toastElement("Newer").focus();
    });
    await waitFor(() => {
      expect(regionElement()).toHaveAttribute("data-expanded");
    });
  });

  it("closes a toast with Escape unless it is not dismissible", async () => {
    render(<Toaster theme="light" />);
    await showToast("Sticky", { dismissible: false });
    await showToast("Escapable");
    fireEvent.keyDown(toastElement("Sticky"), { key: "Escape" });
    fireEvent.keyDown(toastElement("Escapable"), { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByText("Escapable")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Sticky")).toBeInTheDocument();
  });
});
