import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShareDialog, type SharePlatform } from "./share-dialog";

const platforms: SharePlatform[] = [
  {
    buildUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    key: "x",
    label: "X",
  },
  {
    buildUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    key: "linkedin",
    label: "LinkedIn",
  },
];

describe("ShareDialog", () => {
  it("keeps content closed by default", () => {
    render(<ShareDialog platforms={platforms} />);
    expect(screen.queryByText("Share")).not.toBeInTheDocument();
  });

  it("renders the title, platform buttons, and default copy-link label when open", () => {
    render(<ShareDialog open platforms={platforms} />);
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });

  it("renders the override title, description, and copy-link label", () => {
    render(
      <ShareDialog
        description="Share this run"
        labels={{ copied: "Copied", copyLink: "Get link" }}
        open
        platforms={platforms}
        title="Send"
      />,
    );
    expect(screen.getByText("Send")).toBeInTheDocument();
    expect(screen.getByText("Share this run")).toBeInTheDocument();
    expect(screen.getByText("Get link")).toBeInTheDocument();
  });
});

function ControlledShare() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        type="button"
      >
        Share page
      </button>
      <ShareDialog onOpenChange={setOpen} open={open} platforms={platforms} />
    </>
  );
}

describe("ShareDialog focus return", () => {
  it("returns focus to the external opener after Escape", async () => {
    render(<ControlledShare />);
    const opener = screen.getByRole("button", { name: "Share page" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});
