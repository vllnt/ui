import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSection } from "./profile-section";

const dict = {
  profile: {
    name: "bv",
    tagline: "Building calm spatial UIs",
  },
};

const socialLinks = [
  { href: "https://x.com/bv", label: "X" },
  { href: "https://github.com/bv", label: "GitHub" },
];

describe("ProfileSection", () => {
  it("renders an h3 name, tagline, profile image and social links by default", () => {
    render(<ProfileSection dict={dict} socialLinks={socialLinks} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "bv" }),
    ).toBeInTheDocument();
    expect(screen.getByText("> Building calm spatial UIs")).toBeInTheDocument();
    expect(screen.getByAltText("bv Profile")).toBeInTheDocument();
    expect(screen.getByText("X").closest("a")).toHaveAttribute(
      "href",
      "https://x.com/bv",
    );
    expect(screen.getByText("GitHub").closest("a")).toHaveAttribute(
      "href",
      "https://github.com/bv",
    );
  });

  it("uses the compact tagline and hides image and social links when compact", () => {
    render(<ProfileSection compact dict={dict} socialLinks={socialLinks} />);
    expect(screen.getByText("Building calm spatial UIs")).toBeInTheDocument();
    expect(screen.queryByAltText("bv Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("X")).not.toBeInTheDocument();
  });

  it("uses the override imageAlt when provided", () => {
    render(<ProfileSection dict={dict} imageAlt="custom alt" />);
    expect(screen.getByAltText("custom alt")).toBeInTheDocument();
  });

  it("renders the name with the heading tag passed via the as prop", () => {
    render(<ProfileSection as="h1" dict={dict} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "bv" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "bv" }),
    ).not.toBeInTheDocument();
  });
});
