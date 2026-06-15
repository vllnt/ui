import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AIArtifact,
  AIArtifactContent,
  AIArtifactCopyButton,
  AIArtifactDownloadButton,
  AIArtifactEditButton,
  AIArtifactFullscreenButton,
  AIArtifactToolbar,
  AIArtifactVersion,
  AIArtifactVersions,
} from "./ai-artifact";

type ClipboardLike = {
  writeText: (value: string) => Promise<void>;
};

function setClipboard(clipboard: ClipboardLike): () => void {
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

const VALUE = "const greet = (name: string) => `Hello, ${name}`;";

const noopRestoreClipboard = (): void => undefined;

describe("AIArtifact", () => {
  describe("rendering", () => {
    it("renders the title and language badge", () => {
      render(
        <AIArtifact language="tsx" title="UserProfile.tsx" value={VALUE}>
          <AIArtifactContent>{VALUE}</AIArtifactContent>
        </AIArtifact>,
      );

      expect(
        screen.getByRole("heading", { level: 3, name: "UserProfile.tsx" }),
      ).toBeInTheDocument();
      expect(screen.getByText("tsx")).toBeInTheDocument();
    });

    it("emits data-type and aria-label on the section", () => {
      const { container } = render(
        <AIArtifact title="Doc" type="document" value="" />,
      );

      const section = container.querySelector("section");
      expect(section).toHaveAttribute("data-type", "document");
      expect(section).toHaveAttribute("aria-label", "Doc");
    });

    it("falls back to the type when no language is provided", () => {
      render(<AIArtifact title="Doc" type="document" value="" />);

      expect(screen.getByText("document")).toBeInTheDocument();
    });
  });

  describe("AIArtifactCopyButton", () => {
    let restoreClipboard: () => void = noopRestoreClipboard;
    const writeText = vi.fn<(value: string) => Promise<void>>();

    beforeEach(() => {
      writeText.mockReset();
      writeText.mockResolvedValue();
      restoreClipboard = setClipboard({ writeText });
    });

    afterEach(() => {
      restoreClipboard();
    });

    it("writes the value to the clipboard and flips the label", async () => {
      render(
        <AIArtifact title="Doc" value={VALUE}>
          <AIArtifactToolbar>
            <AIArtifactCopyButton />
          </AIArtifactToolbar>
        </AIArtifact>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Copy" }));

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(VALUE);
      });
      await screen.findByRole("button", { name: "Copied" });
    });

    it("does not fire the reset timer after the artifact unmounts", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
      const { unmount } = render(
        <AIArtifact title="Doc" value={VALUE}>
          <AIArtifactToolbar>
            <AIArtifactCopyButton />
          </AIArtifactToolbar>
        </AIArtifact>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      await screen.findByRole("button", { name: "Copied" });
      unmount();
      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe("AIArtifactEditButton", () => {
    it("renders nothing when no onEdit is provided", () => {
      render(
        <AIArtifact title="Doc" value="">
          <AIArtifactToolbar>
            <AIArtifactEditButton />
          </AIArtifactToolbar>
        </AIArtifact>,
      );

      expect(
        screen.queryByRole("button", { name: "Edit" }),
      ).not.toBeInTheDocument();
    });

    it("invokes onEdit when clicked", () => {
      const onEdit = vi.fn();
      render(
        <AIArtifact onEdit={onEdit} title="Doc" value="">
          <AIArtifactToolbar>
            <AIArtifactEditButton />
          </AIArtifactToolbar>
        </AIArtifact>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Edit" }));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe("AIArtifactDownloadButton", () => {
    it("creates an object URL and clicks an anchor", () => {
      const createObjectURL = vi.fn(() => "blob:mock");
      const revokeObjectURL = vi.fn();
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: createObjectURL,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: revokeObjectURL,
      });

      render(
        <AIArtifact title="UserProfile" value={VALUE}>
          <AIArtifactToolbar>
            <AIArtifactDownloadButton />
          </AIArtifactToolbar>
        </AIArtifact>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Download" }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    });
  });

  describe("AIArtifactFullscreenButton", () => {
    it("toggles the data-fullscreen attribute", () => {
      const { container } = render(
        <AIArtifact title="Doc" value="">
          <AIArtifactToolbar>
            <AIArtifactFullscreenButton />
          </AIArtifactToolbar>
        </AIArtifact>,
      );

      expect(container.querySelector("section")).toHaveAttribute(
        "data-fullscreen",
        "false",
      );

      fireEvent.click(screen.getByRole("button", { name: "Enter fullscreen" }));

      expect(container.querySelector("section")).toHaveAttribute(
        "data-fullscreen",
        "true",
      );
      expect(
        screen.getByRole("button", { name: "Exit fullscreen" }),
      ).toBeInTheDocument();
    });
  });

  describe("AIArtifactVersion", () => {
    it("marks the active version with aria-current", () => {
      render(
        <AIArtifact title="Doc" value="">
          <AIArtifactVersions>
            <AIArtifactVersion label="v1" />
            <AIArtifactVersion active label="v2" />
          </AIArtifactVersions>
        </AIArtifact>,
      );

      expect(screen.getByRole("button", { name: "v1" })).not.toHaveAttribute(
        "aria-current",
      );
      expect(screen.getByRole("button", { name: "v2" })).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("forwards onClick", () => {
      const onClick = vi.fn();
      render(
        <AIArtifact title="Doc" value="">
          <AIArtifactVersions>
            <AIArtifactVersion label="v1" onClick={onClick} />
          </AIArtifactVersions>
        </AIArtifact>,
      );

      fireEvent.click(screen.getByRole("button", { name: "v1" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
