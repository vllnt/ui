import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSection } from "./profile-section";

const dict = {
  profile: {
    name: "bv",
    tagline: "Building calm spatial UIs",
  },
};

describe("ProfileSection", () => {
  it("renders the name and tagline", () => {
    render(<ProfileSection dict={dict} />);

    expect(screen.getByText("bv")).toBeInTheDocument();
    expect(screen.getByText("> Building calm spatial UIs")).toBeInTheDocument();
  });

  it("uses the compact tagline format when compact is true", () => {
    render(<ProfileSection compact dict={dict} />);

    expect(screen.getByText("Building calm spatial UIs")).toBeInTheDocument();
  });

  it("renders the profile image when not compact", () => {
    render(<ProfileSection dict={dict} />);

    expect(screen.getByAltText("bv Profile")).toBeInTheDocument();
  });

  it("hides the profile image when compact", () => {
    render(<ProfileSection compact dict={dict} />);

    expect(screen.queryByAltText("bv Profile")).not.toBeInTheDocument();
  });

  it("renders social links when provided", () => {
    render(
      <ProfileSection
        dict={dict}
        socialLinks={[
          { href: "https://x.com/bv", label: "X" },
          { href: "https://github.com/bv", label: "GitHub" },
        ]}
      />,
    );

    expect(screen.getByText("X").closest("a")).toHaveAttribute(
      "href",
      "https://x.com/bv",
    );
    expect(screen.getByText("GitHub").closest("a")).toHaveAttribute(
      "href",
      "https://github.com/bv",
    );
  });

  it("hides social links when compact", () => {
    render(
      <ProfileSection
        compact
        dict={dict}
        socialLinks={[{ href: "https://x.com/bv", label: "X" }]}
      />,
    );

    expect(screen.queryByText("X")).not.toBeInTheDocument();
  });

  it("uses the override imageAlt when provided", () => {
    render(<ProfileSection dict={dict} imageAlt="custom alt" />);

    expect(screen.getByAltText("custom alt")).toBeInTheDocument();
  });

  it("renders the name as an h3 heading by default", () => {
    render(<ProfileSection dict={dict} />);

    const heading = screen.getByRole("heading", { level: 3, name: "bv" });
    expect(heading).toBeInTheDocument();
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
