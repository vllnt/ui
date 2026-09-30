import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
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

const withToolbar = (
  button: ReactNode,
  props?: Partial<ComponentProps<typeof AIArtifact>>,
) =>
  render(
    <AIArtifact title="Doc" value={VALUE} {...props}>
      <AIArtifactToolbar>{button}</AIArtifactToolbar>
    </AIArtifact>,
  );

describe("AIArtifact", () => {
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

  it("emits data-type and aria-label, falling back to the type as badge", () => {
    const { container } = render(
      <AIArtifact title="Doc" type="document" value="" />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-type", "document");
    expect(section).toHaveAttribute("aria-label", "Doc");
    expect(screen.getByText("document")).toBeInTheDocument();
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
      withToolbar(<AIArtifactCopyButton />);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(VALUE);
      });
      await screen.findByRole("button", { name: "Copied" });
    });

    it("does not fire the reset timer after the artifact unmounts", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
      const { unmount } = withToolbar(<AIArtifactCopyButton />);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      await screen.findByRole("button", { name: "Copied" });
      unmount();
      await new Promise((resolve) => setTimeout(resolve, 2100));
      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  it("AIArtifactEditButton renders nothing without onEdit", () => {
    withToolbar(<AIArtifactEditButton />);
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("AIArtifactEditButton invokes onEdit when clicked", () => {
    const onEdit = vi.fn();
    withToolbar(<AIArtifactEditButton />, { onEdit });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("AIArtifactDownloadButton creates an object URL and clicks an anchor", () => {
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
    withToolbar(<AIArtifactDownloadButton />, { title: "UserProfile" });
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it("AIArtifactFullscreenButton toggles the data-fullscreen attribute", () => {
    const { container } = withToolbar(<AIArtifactFullscreenButton />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-fullscreen", "false");
    fireEvent.click(screen.getByRole("button", { name: "Enter fullscreen" }));
    expect(section).toHaveAttribute("data-fullscreen", "true");
    expect(
      screen.getByRole("button", { name: "Exit fullscreen" }),
    ).toBeInTheDocument();
  });

  it("AIArtifactVersion marks the active version with aria-current and forwards onClick", () => {
    const onClick = vi.fn();
    render(
      <AIArtifact title="Doc" value="">
        <AIArtifactVersions>
          <AIArtifactVersion label="v1" onClick={onClick} />
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
    fireEvent.click(screen.getByRole("button", { name: "v1" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
