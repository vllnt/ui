import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NetworkMenuList, type SiteNetwork } from "./network-menu-list";

const network: SiteNetwork = {
  groups: [
    {
      id: "parent",
      items: [{ current: false, href: "https://example.com", label: "vllnt" }],
    },
    {
      heading: "Learn and build",
      id: "learn-build",
      items: [
        {
          current: true,
          href: "https://oss.example.com",
          label: "Open Source",
        },
        { current: false, href: "https://ui.example.com", label: "ui" },
      ],
    },
  ],
  label: "vllnt network",
};

describe("NetworkMenuList", () => {
  it("lists every other site as a link and the current one as text", () => {
    render(<NetworkMenuList network={network} />);

    expect(screen.getByRole("link", { name: "vllnt" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByRole("link", { name: "ui" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Open Source" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Open Source")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("site shell standard: marks the current site by weight, not by colour alone", () => {
    render(<NetworkMenuList network={network} />);

    expect(screen.getByText("Open Source")).toHaveClass(
      "font-medium",
      "bg-secondary",
    );
    expect(screen.getByRole("link", { name: "ui" })).toHaveClass("font-normal");
  });

  it("names each headed group by its heading", () => {
    render(<NetworkMenuList network={network} />);

    const list = screen.getByRole("list", { name: "Learn and build" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  it("is a group named by the network label by default", () => {
    render(<NetworkMenuList network={network} />);

    expect(
      screen.getByRole("group", { name: "vllnt network" }),
    ).toBeInTheDocument();
  });

  it("drops the title and the group role when untitled", () => {
    render(<NetworkMenuList network={network} titled={false} />);

    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByText("vllnt network")).not.toBeInTheDocument();
  });

  it("accepts a site config with a version and keys it does not know", () => {
    const config = {
      ...network,
      groups: network.groups.map((group) => ({ ...group, family: "x" })),
      source: "network.json",
      version: 2,
    };

    render(<NetworkMenuList network={config} />);

    expect(screen.getByRole("link", { name: "ui" })).toBeInTheDocument();
    expect(config.source).toBe("network.json");
  });
});
