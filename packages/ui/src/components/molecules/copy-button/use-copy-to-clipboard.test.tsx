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
  parent: Element | null;
  selected: string;
  value: string;
};

function snapshotField(): FieldSnapshot | undefined {
  const field = document.querySelector("textarea");
  if (!field) return undefined;
  return {
    focused: document.activeElement === field,
    parent: field.parentElement,
    selected: field.value.slice(field.selectionStart, field.selectionEnd),
    value: field.value,
  };
}

function selectPageText(text: string): null | Selection {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  document.body.append(paragraph);
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return selection;
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

    it("gives focus back to the element that had it from the keyboard", async () => {
      const button = document.createElement("button");
      document.body.append(button);
      button.focus();

      await copyValue("secret");

      expect(document.activeElement).toBe(button);
    });

    it("does not move focus back onto an element the pointer focused", async () => {
      const button = document.createElement("button");
      document.body.append(button);
      button.focus();
      vi.spyOn(button, "matches").mockReturnValue(false);
      const focus = vi.spyOn(button, "focus");

      await copyValue("secret");

      expect(focus).not.toHaveBeenCalled();
      expect(document.activeElement).not.toBe(button);
    });

    it.each([
      [
        "next to a focused button",
        () => {
          const host = document.createElement("div");
          const focused = document.createElement("button");
          host.append(focused);
          return { focused, host };
        },
      ],
      [
        "next to a focused input",
        () => {
          const host = document.createElement("div");
          const focused = document.createElement("input");
          host.append(focused);
          return { focused, host };
        },
      ],
      [
        "inside a focused container",
        () => {
          const host = document.createElement("div");
          host.tabIndex = -1;
          return { focused: host, host };
        },
      ],
      [
        "inside a focused native dialog",
        () => {
          const host = document.createElement("dialog");
          host.setAttribute("open", "");
          host.tabIndex = -1;
          return { focused: host, host };
        },
      ],
    ])(
      "mounts the textarea %s so a focus trap around it keeps it",
      async (_name, create) => {
        const { focused, host } = create();
        document.body.append(host);
        focused.focus();
        let seen: FieldSnapshot | undefined;
        execCommand.mockImplementation(() => {
          seen = snapshotField();
          return true;
        });

        await copyValue("secret");

        expect(seen?.parent).toBe(host);
        expect(host.querySelector("textarea")).toBeNull();
      },
    );

    it("mounts the textarea in the body when nothing has focus", async () => {
      let seen: FieldSnapshot | undefined;
      execCommand.mockImplementation(() => {
        seen = snapshotField();
        return true;
      });

      await copyValue("secret");

      expect(seen?.parent).toBe(document.body);
    });

    it("sizes the textarea at 16px so iOS does not zoom into it", async () => {
      let fontSize = "";
      execCommand.mockImplementation(() => {
        fontSize = document.querySelector("textarea")?.style.fontSize ?? "";
        return true;
      });

      await copyValue("secret");

      expect(fontSize).toBe("16px");
    });

    it("keeps the page text selection the user had before copying", async () => {
      const selection = selectPageText("page text");
      execCommand.mockImplementation(() => {
        document.getSelection()?.removeAllRanges();
        return true;
      });

      await copyValue("secret");

      expect(selection?.rangeCount).toBe(1);
      expect(selection?.toString()).toBe("page text");
    });

    it("keeps the page text selection when the copy command fails", async () => {
      const selection = selectPageText("page text");
      execCommand.mockImplementation(() => {
        document.getSelection()?.removeAllRanges();
        return false;
      });

      await copyValue("secret");

      expect(selection?.toString()).toBe("page text");
    });

    it("does not invent a selection when the page had none", async () => {
      document.getSelection()?.removeAllRanges();

      await copyValue("secret");

      expect(document.getSelection()?.rangeCount).toBe(0);
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
