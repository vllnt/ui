import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StaticCode } from "./static-code";
import { StaticCodeCopy } from "./static-code-copy";

type ClipboardLike = {
  writeText: (value: string) => Promise<void>;
};

function setClipboard(clipboard: ClipboardLike | undefined): () => void {
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
    writable: true,
  });
  return () => {
    if (original) {
      Object.defineProperty(navigator, "clipboard", original);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  };
}

function noop(): void {
  return;
}

const SNIPPET = "const greeting = 'hello';";

describe("StaticCode", () => {
  let restoreClipboard: () => void = noop;
  const writeText = vi.fn<(value: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue();
    restoreClipboard = setClipboard({ writeText });
  });

  afterEach(() => {
    restoreClipboard();
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders the highlighted source code", () => {
      render(<StaticCode code={SNIPPET} language="typescript" />);

      expect(screen.getByText(/greeting/)).toBeInTheDocument();
    });

    it("renders the copy island button", () => {
      render(<StaticCode code={SNIPPET} />);

      expect(
        screen.getByRole("button", { name: "Copy code" }),
      ).toBeInTheDocument();
    });
  });

  describe("copy interaction", () => {
    it("writes the code to the clipboard on click", async () => {
      render(<StaticCodeCopy value={SNIPPET} />);

      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(SNIPPET);
      });
    });

    it("flips the accessible label to copied after a successful copy", async () => {
      render(<StaticCodeCopy value={SNIPPET} />);

      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

      await screen.findByRole("button", { name: "Copied" });
    });

    it("does not throw when the clipboard API is unavailable", async () => {
      restoreClipboard();
      restoreClipboard = setClipboard(undefined);

      render(<StaticCodeCopy value={SNIPPET} />);

      const button = screen.getByRole("button", { name: "Copy code" });
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();

      await Promise.resolve();
      expect(button).toHaveAccessibleName("Copy code");
    });

    it("does not throw when writeText rejects (permission denied)", async () => {
      writeText.mockRejectedValue(new Error("NotAllowedError"));

      render(<StaticCodeCopy value={SNIPPET} />);

      const button = screen.getByRole("button", { name: "Copy code" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalled();
      });
      expect(button).toHaveAccessibleName("Copy code");
    });
  });
});
