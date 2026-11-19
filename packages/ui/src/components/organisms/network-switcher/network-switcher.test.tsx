import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SiteNetwork } from "../../molecules/network-menu-list/network-menu-list";

import { NetworkSwitcher } from "./network-switcher";

const network: SiteNetwork = {
  groups: [
    {
      heading: "Platforms",
      id: "platforms",
      items: [
        { current: false, href: "https://maia.example.com", label: "Maia" },
        {
          current: false,
          href: "https://console.example.com",
          label: "Console",
        },
      ],
    },
  ],
  label: "vllnt network",
};

/** Makes `(min-width: Npx)` match up to `width`. */
function setViewportWidth(width: number) {
  vi.stubGlobal("matchMedia", (query: string) => {
    const minimum = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0);
    return {
      addEventListener: vi.fn(),
      matches: width >= minimum,
      media: query,
      removeEventListener: vi.fn(),
    };
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function trigger() {
  return screen.getByRole("button", { name: "vllnt network" });
}

describe("NetworkSwitcher", () => {
  it("opens a panel of the network's sites from 768 px", () => {
    setViewportWidth(1024);
    render(<NetworkSwitcher network={network} />);

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByRole("navigation", { name: "vllnt network" });
    expect(panel).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-controls", panel.id);
    expect(within(panel).getByRole("link", { name: "Maia" })).toHaveAttribute(
      "href",
      "https://maia.example.com",
    );
  });

  it("toggles closed on a second click", () => {
    setViewportWidth(1024);
    render(<NetworkSwitcher network={network} />);

    fireEvent.click(trigger());
    fireEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and hands focus back to the button", () => {
    setViewportWidth(1024);
    render(<NetworkSwitcher network={network} />);

    fireEvent.click(trigger());
    fireEvent.keyDown(window, { key: "Escape" });

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("closes on a press outside", () => {
    setViewportWidth(1024);
    render(
      <>
        <NetworkSwitcher network={network} />
        <p>Outside</p>
      </>,
    );

    fireEvent.click(trigger());
    fireEvent.pointerDown(screen.getByText("Outside"));

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("holds no links on a phone, where the header menu lists them", () => {
    setViewportWidth(375);
    render(<NetworkSwitcher network={network} />);

    fireEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("site shell standard: the button keeps a 44 px target and only shrinks for a fine pointer from 1200 px", () => {
    setViewportWidth(1024);
    render(<NetworkSwitcher network={network} />);

    expect(trigger()).toHaveClass(
      "h-11",
      "min-[1200px]:[@media(pointer:fine)]:h-9",
    );
  });
});
