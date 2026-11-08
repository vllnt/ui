import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "./use-copy-to-clipboard";

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);

function setClipboard(value: undefined | { writeText: () => Promise<void> }) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value,
    writable: true,
  });
}

function setExecCommand(value: ((command: string) => boolean) | undefined) {
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    value,
    writable: true,
  });
}

type FieldSnapshot = {
  focused: boolean;
  insideDialog: boolean;
  selected: string;
  value: string;
};

function snapshotField(): FieldSnapshot | undefined {
  const field = document.querySelector("textarea");
  if (!field) return undefined;
  return {
    focused: document.activeElement === field,
    insideDialog: field.closest('[role="dialog"]') !== null,
    selected: field.value.slice(field.selectionStart, field.selectionEnd),
    value: field.value,
  };
}

async function copyValue(value: string) {
  const hook = renderHook(() => useCopyToClipboard());
  let result = false;
  await act(async () => {
    result = await hook.result.current.copy(value);
  });
  return { copied: hook.result.current.copied, hook, result };
}

describe("useCopyToClipboard", () => {
  const execCommand = vi.fn<(command: string) => boolean>();

  beforeEach(() => {
    execCommand.mockReset();
    execCommand.mockReturnValue(true);
    setExecCommand(execCommand);
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
    Reflect.deleteProperty(document, "execCommand");
    document.body.replaceChildren();
  });

  describe("with the Clipboard API", () => {
    it("writes through the API and skips the fallback", async () => {
      const writeText = vi.fn(() => Promise.resolve());
      setClipboard({ writeText });

      const { copied, result } = await copyValue("secret");

      expect(result).toBe(true);
      expect(copied).toBe(true);
      expect(writeText).toHaveBeenCalledWith("secret");
      expect(execCommand).not.toHaveBeenCalled();
    });
  });

  describe("without the Clipboard API (plain http)", () => {
    beforeEach(() => {
      setClipboard(undefined);
    });

    it("copies the value through a temporary textarea and reports copied", async () => {
      let seen: FieldSnapshot | undefined;
      execCommand.mockImplementation(() => {
        seen = snapshotField();
        return true;
      });

      const { copied, result } = await copyValue("secret");

      expect(result).toBe(true);
      expect(copied).toBe(true);
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(seen).toMatchObject({
        focused: true,
        selected: "secret",
        value: "secret",
      });
      expect(document.querySelector("textarea")).toBeNull();
    });

    it("gives focus back to the element that had it", async () => {
      const button = document.createElement("button");
      document.body.append(button);
      button.focus();

      await copyValue("secret");

      expect(document.activeElement).toBe(button);
    });

    it("mounts the textarea inside an open dialog so its focus trap keeps it", async () => {
      const dialog = document.createElement("div");
      dialog.setAttribute("role", "dialog");
      const button = document.createElement("button");
      dialog.append(button);
      document.body.append(dialog);
      button.focus();
      let seen: FieldSnapshot | undefined;
      execCommand.mockImplementation(() => {
        seen = snapshotField();
        return true;
      });

      await copyValue("secret");

      expect(seen?.insideDialog).toBe(true);
      expect(dialog.querySelector("textarea")).toBeNull();
    });

    it("reports failure when the browser refuses the copy command", async () => {
      execCommand.mockReturnValue(false);

      const { copied, result } = await copyValue("secret");

      expect(result).toBe(false);
      expect(copied).toBe(false);
      expect(document.querySelector("textarea")).toBeNull();
    });

    it("reports failure when the copy command throws", async () => {
      execCommand.mockImplementation(() => {
        throw new Error("blocked");
      });

      const { copied, result } = await copyValue("secret");

      expect(result).toBe(false);
      expect(copied).toBe(false);
      expect(document.querySelector("textarea")).toBeNull();
    });

    it("reports failure when the copy command does not exist", async () => {
      setExecCommand(undefined);

      const { copied, result } = await copyValue("secret");

      expect(result).toBe(false);
      expect(copied).toBe(false);
    });
  });

  describe("when the Clipboard API rejects", () => {
    beforeEach(() => {
      setClipboard({ writeText: () => Promise.reject(new Error("denied")) });
    });

    it("falls back to the textarea copy and reports copied", async () => {
      const { copied, result } = await copyValue("secret");

      expect(result).toBe(true);
      expect(copied).toBe(true);
      expect(execCommand).toHaveBeenCalledWith("copy");
    });

    it("reports failure when the fallback fails too", async () => {
      execCommand.mockReturnValue(false);

      const { copied, result } = await copyValue("secret");

      expect(result).toBe(false);
      expect(copied).toBe(false);
    });
  });

  it("clears a stale copied flag when a later copy fails", async () => {
    setClipboard({ writeText: () => Promise.resolve() });
    const hook = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await hook.result.current.copy("first");
    });
    expect(hook.result.current.copied).toBe(true);

    setClipboard(undefined);
    execCommand.mockReturnValue(false);
    await act(async () => {
      await hook.result.current.copy("second");
    });

    expect(hook.result.current.copied).toBe(false);
  });
});
