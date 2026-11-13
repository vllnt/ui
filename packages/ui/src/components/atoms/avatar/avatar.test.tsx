import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarPresence,
} from "./avatar";

class LoadedImage extends EventTarget {
  complete = true;
  crossOrigin: null | string = null;
  naturalWidth = 1;
  referrerPolicy = "";
  src = "";
}

const presences: AvatarPresence[] = ["online", "away", "busy"];

describe("Avatar", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(<Avatar className="custom-class" ref={ref} />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("Avatar default render", () => {
  it("keeps the 40 px circle that existing consumers rely on", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toHaveClass(
      "relative",
      "flex",
      "size-10",
      "shrink-0",
      "overflow-hidden",
      "rounded-full",
    );
  });

  it("renders no presence marker and no status word", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(container.querySelector("[data-presence]")).toBeNull();
    expect(screen.queryByText("Online")).toBeNull();
    expect(screen.queryByText("Away")).toBeNull();
    expect(screen.queryByText("Busy")).toBeNull();
  });

  it("keeps the fallback surface and does not set a fallback text size", () => {
    render(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText("AL");
    expect(fallback).toHaveClass(
      "flex",
      "h-full",
      "w-full",
      "items-center",
      "justify-center",
      "rounded-full",
      "bg-muted",
    );
    expect(fallback.className).not.toContain("text-");
  });
});

describe("Avatar size", () => {
  it.each([
    ["xs", "size-6", "text-xs"],
    ["sm", "size-8", "text-sm"],
    ["lg", "size-12", "text-lg"],
    ["xl", "size-16", "text-2xl"],
  ] as const)("renders %s as %s with %s text", (size, box, text) => {
    const { container } = render(<Avatar size={size} />);
    expect(container.firstChild).toHaveClass(box, text);
    expect(container.firstChild).not.toHaveClass("size-10");
  });

  it("renders md as size-10 and leaves the text size to the parent", () => {
    const { container } = render(<Avatar size="md" />);
    expect(container.firstChild).toHaveClass("size-10");
    expect(container.firstElementChild?.className).not.toContain("text-");
  });

  it("lets className override the size, as AvatarGroup does", () => {
    const { container } = render(<Avatar className="size-12" size="xs" />);
    expect(container.firstChild).toHaveClass("size-12");
    expect(container.firstChild).not.toHaveClass("size-6");
  });
});

describe("Avatar shape", () => {
  it("renders square with rounded-md on the root and the fallback", () => {
    const { container } = render(
      <Avatar shape="square">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toHaveClass("rounded-md");
    expect(container.firstChild).not.toHaveClass("rounded-full");
    expect(screen.getByText("AL")).toHaveClass("rounded-md");
    expect(screen.getByText("AL")).not.toHaveClass("rounded-full");
  });

  it("renders circle explicitly the same as the default", () => {
    const { container } = render(
      <Avatar shape="circle">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toHaveClass("rounded-full");
    expect(screen.getByText("AL")).toHaveClass("rounded-full");
  });
});

describe("AvatarImage", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", LoadedImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("replaces the fallback once the image has loaded", async () => {
    render(
      <Avatar>
        <AvatarImage alt="Ada Lovelace" src="/ada.png" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    const image = await screen.findByRole("img", { name: "Ada Lovelace" });
    expect(image).toHaveAttribute("src", "/ada.png");
    expect(image).toHaveClass("aspect-square", "h-full", "w-full");
    expect(image).toHaveClass("rounded-full");
    expect(screen.queryByText("AL")).toBeNull();
  });

  it("follows the square shape", async () => {
    render(
      <Avatar shape="square">
        <AvatarImage alt="Acme" src="/acme.png" />
      </Avatar>,
    );
    const image = await screen.findByRole("img", { name: "Acme" });
    expect(image).toHaveClass("rounded-md");
    expect(image).not.toHaveClass("rounded-full");
  });

  it("merges className and forwards ref", async () => {
    const ref = { current: null };
    render(
      <Avatar>
        <AvatarImage
          alt="Ada"
          className="custom-image"
          ref={ref}
          src="/a.png"
        />
      </Avatar>,
    );
    expect(await screen.findByRole("img", { name: "Ada" })).toHaveClass(
      "custom-image",
    );
    expect(ref.current).toBeInstanceOf(HTMLImageElement);
  });
});

describe("AvatarImage failure path", () => {
  it("keeps the fallback while the image has not loaded", () => {
    render(
      <Avatar>
        <AvatarImage alt="Ada Lovelace" src="/ada.png" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AL")).toBeVisible();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("keeps the fallback when the image has no src", () => {
    render(
      <Avatar>
        <AvatarImage alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AL")).toBeVisible();
  });
});

describe("Avatar presence", () => {
  it.each([
    ["online", "Online"],
    ["away", "Away"],
    ["busy", "Busy"],
  ] as const)(
    "renders %s with the visually hidden word %s",
    (presence, word) => {
      const { container } = render(<Avatar presence={presence} />);
      expect(screen.getByText(word)).toHaveClass("sr-only");
      expect(
        container.querySelector(`[data-presence="${presence}"]`),
      ).not.toBeNull();
      expect(container.querySelectorAll("[data-presence]")).toHaveLength(1);
    },
  );

  it("anchors the marker at the bottom-right", () => {
    const { container } = render(<Avatar presence="online" />);
    expect(container.querySelector("[data-presence]")).toHaveClass(
      "absolute",
      "bottom-0",
      "right-0",
      "rounded-full",
    );
  });

  it("draws online as a filled dot", () => {
    const { container } = render(<Avatar presence="online" />);
    const marker = container.querySelector("[data-presence]");
    expect(marker).toHaveClass("bg-success");
    expect(marker).not.toHaveClass("border-2");
    expect(marker?.querySelector("[aria-hidden]")).toBeNull();
  });

  it("draws away as a ring", () => {
    const { container } = render(<Avatar presence="away" />);
    const marker = container.querySelector("[data-presence]");
    expect(marker).toHaveClass("border-2", "border-warning", "bg-background");
    expect(marker?.querySelector("[aria-hidden]")).toBeNull();
  });

  it("draws busy as a dot with a bar", () => {
    const { container } = render(<Avatar presence="busy" />);
    const marker = container.querySelector("[data-presence]");
    expect(marker).toHaveClass("bg-destructive");
    expect(marker).not.toHaveClass("border-2");
    expect(marker?.querySelector("[aria-hidden='true']")).toHaveClass(
      "h-0.5",
      "w-1/2",
    );
  });

  it("gives every status a different shape, not only a different colour", () => {
    const shapes = presences.map((presence) => {
      const { container, unmount } = render(<Avatar presence={presence} />);
      const marker = container.querySelector("[data-presence]");
      const signature = [
        marker?.classList.contains("border-2") === true,
        marker?.querySelector("[aria-hidden]") !== null,
      ].join("-");
      unmount();
      return signature;
    });
    expect(new Set(shapes).size).toBe(presences.length);
  });

  it("scales the marker with the avatar size", () => {
    const { container, rerender } = render(
      <Avatar presence="online" size="xs" />,
    );
    expect(container.querySelector("[data-presence]")).toHaveClass("size-2");
    rerender(<Avatar presence="online" size="xl" />);
    expect(container.querySelector("[data-presence]")).toHaveClass("size-4");
    rerender(<Avatar presence="online" />);
    expect(container.querySelector("[data-presence]")).toHaveClass("size-3");
  });

  it("lets the marker sit on the edge instead of clipping it", () => {
    const { container } = render(<Avatar presence="online" />);
    expect(container.firstChild).not.toHaveClass("overflow-hidden");
    expect(container.firstChild).toHaveClass("relative", "size-10");
  });

  it("follows the square shape on the root and the fallback", () => {
    const { container } = render(
      <Avatar presence="busy" shape="square">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toHaveClass("rounded-md");
    expect(screen.getByText("AL")).toHaveClass("rounded-md");
  });

  it("renders the marker after the fallback so both stay in the tree", () => {
    render(
      <Avatar presence="away">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AL")).toBeVisible();
    expect(screen.getByText("Away")).toBeInTheDocument();
  });
});

describe("Avatar presenceLabels", () => {
  it("uses the given words", () => {
    render(
      <Avatar
        presence="online"
        presenceLabels={{ away: "Absent", busy: "Occupe", online: "En ligne" }}
      />,
    );
    expect(screen.getByText("En ligne")).toHaveClass("sr-only");
    expect(screen.queryByText("Online")).toBeNull();
  });

  it("falls back to English for a value that is missing from the labels", () => {
    render(<Avatar presence="busy" presenceLabels={{ online: "En ligne" }} />);
    expect(screen.getByText("Busy")).toBeInTheDocument();
  });

  it("falls back to English for a label set to undefined", () => {
    render(<Avatar presence="online" presenceLabels={{ online: undefined }} />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("ignores labels when there is no presence", () => {
    const { container } = render(
      <Avatar presenceLabels={{ online: "En ligne" }} />,
    );
    expect(container.querySelector("[data-presence]")).toBeNull();
    expect(screen.queryByText("En ligne")).toBeNull();
  });
});

describe("Avatar props", () => {
  it("forwards ref and native attributes with a presence marker", () => {
    const ref = { current: null };
    render(
      <Avatar
        className="custom-class"
        data-testid="avatar"
        presence="online"
        ref={ref}
      />,
    );
    expect(screen.getByTestId("avatar")).toHaveClass("custom-class");
    expect(ref.current).toBe(screen.getByTestId("avatar"));
  });
});
