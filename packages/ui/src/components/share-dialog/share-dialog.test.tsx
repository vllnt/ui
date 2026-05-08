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

  it("renders the title + platform buttons when open", () => {
    render(<ShareDialog open platforms={platforms} />);

    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("renders the override title and description", () => {
    render(
      <ShareDialog
        description="Share this run"
        open
        platforms={platforms}
        title="Send"
      />,
    );

    expect(screen.getByText("Send")).toBeInTheDocument();
    expect(screen.getByText("Share this run")).toBeInTheDocument();
  });

  it("renders the copy-link button with the default label", () => {
    render(<ShareDialog open platforms={platforms} />);

    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });

  it("renders the copy-link button with override labels", () => {
    render(
      <ShareDialog
        labels={{ copied: "Copied", copyLink: "Get link" }}
        open
        platforms={platforms}
      />,
    );

    expect(screen.getByText("Get link")).toBeInTheDocument();
  });
});
