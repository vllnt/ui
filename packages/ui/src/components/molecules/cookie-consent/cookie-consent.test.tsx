import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CookieConsent, type CookieConsentProps } from "./cookie-consent";

/** Clicks the first match; the banner renders mobile and desktop copies. */
function clickFirstButton(name: string): void {
  const [button] = screen.getAllByRole("button", { name });
  if (!button) throw new Error(`Missing "${name}" button`);
  fireEvent.click(button);
}

/** Advances timers inside act to flush the open/close animation delays. */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders an accessible dialog with default copy and no optional controls", () => {
    render(<CookieConsent open={true} />);
    const dialog = screen.getByRole("dialog");
    expect(screen.getByLabelText("Cookie consent")).toBe(dialog);
    expect(dialog).toHaveAttribute("aria-live", "polite");
    // Message and buttons appear in both mobile and desktop layouts
    expect(
      screen.getAllByText("This site uses cookies to improve your experience."),
    ).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Accept" })).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Decline" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Learn more" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<CookieConsent open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders custom copy, optional controls, className, and extra attributes", () => {
    render(
      <CookieConsent
        acceptText="I Agree"
        className="custom-class"
        data-testid="cookie-banner"
        declineText="Decline"
        message="Custom cookie message"
        open={true}
        settingsHref="/privacy"
        showCloseButton={true}
      />,
    );
    expect(screen.getAllByText("Custom cookie message")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "I Agree" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Decline" })).toHaveLength(2);
    const links = screen.getAllByRole("link", { name: "Learn more" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("button", { name: "Close cookie consent" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveClass("custom-class");
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });

  it("displays custom settings text", () => {
    render(
      <CookieConsent
        open={true}
        settingsHref="/privacy"
        settingsText="Privacy Policy"
      />,
    );
    expect(
      screen.getAllByRole("link", { name: "Privacy Policy" }),
    ).toHaveLength(2);
  });

  it("calls onAccept when accept button is clicked", () => {
    const handleAccept = vi.fn();
    render(<CookieConsent onAccept={handleAccept} open={true} />);
    clickFirstButton("Accept");
    expect(handleAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onDecline when decline button is clicked", () => {
    const handleDecline = vi.fn();
    render(
      <CookieConsent
        declineText="Decline"
        onDecline={handleDecline}
        open={true}
      />,
    );
    clickFirstButton("Decline");
    expect(handleDecline).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "accept",
      {},
      () => {
        clickFirstButton("Accept");
      },
    ],
    [
      "decline",
      { declineText: "Decline" },
      () => {
        clickFirstButton("Decline");
      },
    ],
    [
      "close button",
      { showCloseButton: true },
      () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Close cookie consent" }),
        );
      },
    ],
  ] as const)(
    "calls onOpenChange with false after %s",
    async (_name, props, dismiss) => {
      const handleOpenChange = vi.fn();
      render(
        <CookieConsent
          {...props}
          onOpenChange={handleOpenChange}
          open={true}
        />,
      );
      dismiss();
      await advance(200);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    },
  );

  it("animates in after the mount delay and out on accept", async () => {
    render(<CookieConsent onOpenChange={vi.fn()} open={true} />);
    const dialog = screen.getByRole("dialog");
    // Initially hidden (translate-y-4 opacity-0)
    expect(dialog).toHaveClass("opacity-0");
    await advance(50);
    expect(dialog).toHaveClass("opacity-100");
    clickFirstButton("Accept");
    expect(dialog).toHaveClass("opacity-0");
  });

  it.each([
    ["applies bottom-left position by default", {}, ["bottom-4", "left-4"]],
    [
      "applies bottom-right position",
      { position: "bottom-right" } satisfies CookieConsentProps,
      ["bottom-4", "right-4"],
    ],
    [
      "applies bottom-center position",
      { position: "bottom-center" } satisfies CookieConsentProps,
      ["bottom-4", "left-1/2", "-translate-x-1/2"],
    ],
  ])("%s", (_name, props, classes) => {
    render(<CookieConsent {...props} open={true} />);
    expect(screen.getByRole("dialog")).toHaveClass(...classes);
  });

  describe("accessible name", () => {
    it("names the dialog with the default region label", () => {
      render(<CookieConsent open={true} />);
      const dialog = screen.getByRole("dialog", { name: "Cookie consent" });
      expect(dialog).toHaveAttribute("aria-label", "Cookie consent");
      expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("uses labels.region as the accessible name", () => {
      render(
        <CookieConsent
          labels={{ region: "Consentement aux cookies" }}
          open={true}
        />,
      );
      const dialog = screen.getByRole("dialog", {
        name: "Consentement aux cookies",
      });
      expect(dialog).toHaveAttribute("aria-label", "Consentement aux cookies");
      expect(screen.queryByLabelText("Cookie consent")).not.toBeInTheDocument();
    });

    it("uses labels.close as the accessible name of the close button", () => {
      render(
        <CookieConsent
          labels={{ close: "Fermer" }}
          open={true}
          showCloseButton={true}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Fermer" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Close cookie consent" }),
      ).not.toBeInTheDocument();
    });

    it.each([
      ["an empty labels object", {}],
      ["only the close label", { close: "Fermer" }],
      ["an undefined region", { region: undefined }],
    ] satisfies [string, CookieConsentProps["labels"]][])(
      "falls back to the English region label with %s",
      (_name, labels) => {
        render(<CookieConsent labels={labels} open={true} />);
        expect(
          screen.getByRole("dialog", { name: "Cookie consent" }),
        ).toBeInTheDocument();
      },
    );

    it("falls back to the English close label when labels.close is missing", () => {
      render(
        <CookieConsent
          labels={{ region: "Cookies" }}
          open={true}
          showCloseButton={true}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Close cookie consent" }),
      ).toBeInTheDocument();
    });

    it("labels the dialog from the title through aria-labelledby", () => {
      render(<CookieConsent open={true} title="Audience measurement" />);
      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Audience measurement",
      });
      const dialog = screen.getByRole("dialog", {
        name: "Audience measurement",
      });
      expect(heading.id).not.toBe("");
      expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
      expect(dialog).not.toHaveAttribute("aria-label");
      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("prefers the title over labels.region", () => {
      render(
        <CookieConsent
          labels={{ region: "Consentement aux cookies" }}
          open={true}
          title="Mesure d'audience"
        />,
      );
      expect(
        screen.getByRole("dialog", { name: "Mesure d'audience" }),
      ).not.toHaveAttribute("aria-label");
      expect(
        screen.queryByLabelText("Consentement aux cookies"),
      ).not.toBeInTheDocument();
    });

    it("renders a node title as the heading content", () => {
      render(
        <CookieConsent
          open={true}
          title={
            <span>
              Audience <em>measurement</em>
            </span>
          }
        />,
      );
      expect(
        screen.getByRole("dialog", { name: "Audience measurement" }),
      ).toBeInTheDocument();
    });

    it.each([
      ["an empty string", ""],
      ["null", null],
      ["false", false],
    ])("ignores %s as the title", (_name, title) => {
      render(<CookieConsent open={true} title={title} />);
      const dialog = screen.getByRole("dialog", { name: "Cookie consent" });
      expect(dialog).toHaveAttribute("aria-label", "Cookie consent");
      expect(dialog).not.toHaveAttribute("aria-labelledby");
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("does not pass the title to the dialog as an HTML attribute", () => {
      render(<CookieConsent open={true} title="Audience measurement" />);
      expect(screen.getByRole("dialog")).not.toHaveAttribute("title");
    });

    it("lets an explicit aria-label prop name the dialog", () => {
      render(<CookieConsent aria-label="Custom name" open={true} />);
      expect(
        screen.getByRole("dialog", { name: "Custom name" }),
      ).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("renders the card classes by default", () => {
      render(<CookieConsent open={true} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("rounded-lg", "shadow-lg", "bottom-4");
      expect(dialog).not.toHaveClass("inset-x-0", "w-full");
    });

    it("renders the card classes for layout=card", () => {
      render(<CookieConsent layout="card" open={true} />);
      expect(screen.getByRole("dialog")).toHaveClass("rounded-lg", "shadow-lg");
    });

    it("renders the bar classes for layout=bar", () => {
      render(<CookieConsent layout="bar" open={true} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass(
        "fixed",
        "inset-x-0",
        "bottom-0",
        "w-full",
        "border-x-0",
        "border-b-0",
        "pb-safe",
      );
      expect(dialog).not.toHaveClass("rounded-lg", "shadow-lg", "left-4");
    });

    it("ignores position in the bar layout", () => {
      render(
        <CookieConsent layout="bar" open={true} position="bottom-right" />,
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveClass("right-4", "left-4", "mb-safe");
      expect(dialog).toHaveClass("inset-x-0");
    });

    it("keeps the role and live region in the bar layout", () => {
      render(<CookieConsent layout="bar" open={true} title="Audience" />);
      const dialog = screen.getByRole("dialog", { name: "Audience" });
      expect(dialog).toHaveAttribute("aria-live", "polite");
    });

    it("renders one copy of the content in the bar layout", () => {
      render(
        <CookieConsent
          declineText="Decline"
          layout="bar"
          message="Bar message"
          open={true}
          settingsHref="/privacy"
          settingsText="Privacy"
        />,
      );
      expect(screen.getAllByText("Bar message")).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Accept" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Decline" })).toHaveLength(
        1,
      );
      expect(screen.getAllByRole("link", { name: "Privacy" })).toHaveLength(1);
    });

    it("stacks below md and rows from md in the bar layout", () => {
      render(<CookieConsent layout="bar" open={true} />);
      const row = screen.getByText(
        "This site uses cookies to improve your experience.",
      ).parentElement?.parentElement;
      expect(row).toHaveClass("flex-col", "md:flex-row", "md:items-center");
    });

    it("keeps the content padding off the bar root so pb-safe only adds the safe inset", () => {
      render(<CookieConsent layout="bar" open={true} />);
      const root = screen.getByRole("dialog");
      expect(root).toHaveClass("pb-safe");
      expect(root).not.toHaveClass("p-4", "pb-4");
      const content = screen.getByText(
        "This site uses cookies to improve your experience.",
      ).parentElement?.parentElement;
      expect(content).toHaveClass("p-4", "md:px-6");
      expect(content).not.toHaveClass("pr-10");
    });

    it("reserves room for the close button in the bar content", () => {
      render(<CookieConsent layout="bar" open={true} showCloseButton={true} />);
      const content = screen.getByText(
        "This site uses cookies to improve your experience.",
      ).parentElement?.parentElement;
      expect(content).toHaveClass("pr-10", "md:pr-12");
    });

    it("renders the title before the message in the bar layout", () => {
      render(
        <CookieConsent layout="bar" open={true} title="Audience measurement" />,
      );
      const heading = screen.getByRole("heading", {
        name: "Audience measurement",
      });
      const message = screen.getByText(
        "This site uses cookies to improve your experience.",
      );
      expect(heading.nextElementSibling).toBe(message);
    });

    it("renders the title once above both copies in the card layout", () => {
      render(<CookieConsent open={true} title="Audience measurement" />);
      expect(screen.getAllByRole("heading")).toHaveLength(1);
      expect(screen.getAllByText("Audience measurement")).toHaveLength(1);
    });

    it("renders the privacy link from settingsHref and settingsText", () => {
      render(
        <CookieConsent
          layout="bar"
          open={true}
          settingsHref="/privacy"
          settingsText="Privacy"
        />,
      );
      expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
        "href",
        "/privacy",
      );
    });

    it("renders no privacy link without settingsHref in the bar layout", () => {
      render(<CookieConsent layout="bar" open={true} />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("fires accept, decline and close handlers in the bar layout", async () => {
      const handleAccept = vi.fn();
      const handleDecline = vi.fn();
      const handleOpenChange = vi.fn();
      render(
        <CookieConsent
          declineText="Decline"
          layout="bar"
          onAccept={handleAccept}
          onDecline={handleDecline}
          onOpenChange={handleOpenChange}
          open={true}
          showCloseButton={true}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Accept" }));
      fireEvent.click(screen.getByRole("button", { name: "Decline" }));
      fireEvent.click(
        screen.getByRole("button", { name: "Close cookie consent" }),
      );
      await advance(200);
      expect(handleAccept).toHaveBeenCalledTimes(1);
      expect(handleDecline).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("keeps the bar close button inside the viewport", () => {
      render(<CookieConsent layout="bar" open={true} showCloseButton={true} />);
      const close = screen.getByRole("button", {
        name: "Close cookie consent",
      });
      expect(close).toHaveClass("right-2", "top-2");
      expect(close).not.toHaveClass("-right-2", "-top-2");
    });

    it.each(["card", "bar"] as const)(
      "keeps a 24px close target around the 22px circle in the %s layout",
      (layout) => {
        render(
          <CookieConsent layout={layout} open={true} showCloseButton={true} />,
        );
        const close = screen.getByRole("button", {
          name: "Close cookie consent",
        });
        expect(close).toHaveClass("size-6");
        expect(close.firstElementChild).toHaveClass(
          "rounded-full",
          "border",
          "bg-background",
          "p-1",
        );
      },
    );

    it("animates the bar in after the mount delay", async () => {
      render(<CookieConsent layout="bar" open={true} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("opacity-0");
      await advance(50);
      expect(dialog).toHaveClass("opacity-100");
    });

    it("does not render the bar when open is false", () => {
      render(<CookieConsent layout="bar" open={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("renders a primary accept and a ghost decline by default", () => {
      render(<CookieConsent declineText="Decline" layout="bar" open={true} />);
      expect(screen.getByRole("button", { name: "Accept" })).toHaveClass(
        "bg-primary",
      );
      const decline = screen.getByRole("button", { name: "Decline" });
      expect(decline).toHaveClass("hover:bg-accent");
      expect(decline).not.toHaveClass("border-input", "bg-primary");
    });

    it("renders accept and decline as the same outline button when equal", () => {
      render(
        <CookieConsent
          actions="equal"
          declineText="Decline"
          layout="bar"
          open={true}
        />,
      );
      const accept = screen.getByRole("button", { name: "Accept" });
      const decline = screen.getByRole("button", { name: "Decline" });
      expect(accept).toHaveClass("border", "border-input", "bg-background");
      expect(accept).not.toHaveClass("bg-primary");
      expect(accept.className).toBe(decline.className);
    });

    it("renders both buttons at the 40 px default height when equal in the bar", () => {
      render(
        <CookieConsent
          actions="equal"
          declineText="Decline"
          layout="bar"
          open={true}
        />,
      );
      expect(screen.getByRole("button", { name: "Accept" })).toHaveClass(
        "h-10",
      );
      expect(screen.getByRole("button", { name: "Decline" })).toHaveClass(
        "h-10",
      );
    });

    it("gives both copies of the card the same outline button when equal", () => {
      render(
        <CookieConsent actions="equal" declineText="Decline" open={true} />,
      );
      const accepts = screen.getAllByRole("button", { name: "Accept" });
      const declines = screen.getAllByRole("button", { name: "Decline" });
      expect(accepts).toHaveLength(2);
      expect(declines).toHaveLength(2);
      accepts.forEach((accept, index) => {
        expect(accept).toHaveClass("border-input");
        expect(accept).not.toHaveClass("bg-primary");
        expect(accept.className).toBe(declines[index]?.className);
      });
    });

    it("keeps decline before accept in the DOM when equal", () => {
      render(
        <CookieConsent
          actions="equal"
          declineText="Decline"
          layout="bar"
          open={true}
        />,
      );
      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual(["Decline", "Accept"]);
    });

    it("renders a single outline accept when equal has no declineText", () => {
      render(<CookieConsent actions="equal" layout="bar" open={true} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveClass("border-input");
    });

    it("fires accept and decline handlers when equal", () => {
      const handleAccept = vi.fn();
      const handleDecline = vi.fn();
      render(
        <CookieConsent
          actions="equal"
          declineText="Decline"
          layout="bar"
          onAccept={handleAccept}
          onDecline={handleDecline}
          open={true}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Decline" }));
      expect(handleDecline).toHaveBeenCalledTimes(1);
      expect(handleAccept).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Accept" }));
      expect(handleAccept).toHaveBeenCalledTimes(1);
    });
  });
});
