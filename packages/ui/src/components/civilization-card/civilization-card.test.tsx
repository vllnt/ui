import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CivilizationCard, CivilizationComparison } from "./civilization-card";

const eraBarWidth = () =>
  screen
    .getByRole("img", { name: /Era timeline/ })
    .querySelector<HTMLSpanElement>("span[style]")?.style.width ?? "";

describe("CivilizationCard", () => {
  it("renders the hero globe fallback when no image is provided", () => {
    const { container } = render(<CivilizationCard name="Rome" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the name heading and optional stats, lists, and action", () => {
    render(
      <CivilizationCard
        achievements={["Aqueducts", "Law"]}
        actionHref="/civ/rome"
        capital="Rome"
        leaders={["Augustus", "Trajan"]}
        name="Roman Empire"
        peakPopulation="70 million"
        region="Mediterranean"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Roman Empire" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mediterranean")).toBeInTheDocument();
    expect(screen.getByText("Capital")).toBeInTheDocument();
    expect(screen.getByText("Rome")).toBeInTheDocument();
    expect(screen.getByText("Peak population")).toBeInTheDocument();
    expect(screen.getByText("70 million")).toBeInTheDocument();
    expect(screen.getByText("Aqueducts")).toBeInTheDocument();
    expect(screen.getByText("Law")).toBeInTheDocument();
    expect(screen.getByText("Augustus")).toBeInTheDocument();
    expect(screen.getByText("Trajan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore/ })).toHaveAttribute(
      "href",
      "/civ/rome",
    );
  });

  it("formats BCE/CE era, duration, and a proportional timeline bar", () => {
    const { rerender } = render(
      <CivilizationCard era={{ end: 476, start: -27 }} name="Roman Empire" />,
    );
    expect(screen.getByText("27 BCE – 476 CE")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("503 years")).toBeInTheDocument();
    const shortWidth = eraBarWidth();
    expect(shortWidth).not.toBe("");
    expect(shortWidth).not.toBe("66.66667%");

    rerender(
      <CivilizationCard era={{ end: 1453, start: -2000 }} name="Long" />,
    );
    expect(Number.parseFloat(eraBarWidth())).toBeGreaterThan(
      Number.parseFloat(shortWidth),
    );
  });

  it('uses "present" when end is omitted', () => {
    render(<CivilizationCard era={{ start: 1776 }} name="USA" />);
    expect(screen.getByText("1776 CE – present")).toBeInTheDocument();
  });
});

describe("CivilizationComparison", () => {
  it("renders all child cards", () => {
    render(
      <CivilizationComparison>
        <CivilizationCard name="Rome" />
        <CivilizationCard name="Han" />
      </CivilizationComparison>,
    );
    expect(screen.getByText("Rome")).toBeInTheDocument();
    expect(screen.getByText("Han")).toBeInTheDocument();
  });
});
