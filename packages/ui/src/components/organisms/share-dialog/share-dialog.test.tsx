import { render, screen } from "@testing-library/react";
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
