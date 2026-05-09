import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CivilizationCard, CivilizationComparison } from "./civilization-card";

describe("CivilizationCard", () => {
  describe("rendering", () => {
    it("renders the name as a heading", () => {
      render(<CivilizationCard name="Roman Empire" />);

      expect(
        screen.getByRole("heading", { level: 3, name: "Roman Empire" }),
      ).toBeInTheDocument();
    });

    it("renders region when provided", () => {
      render(<CivilizationCard name="Rome" region="Mediterranean" />);

      expect(screen.getByText("Mediterranean")).toBeInTheDocument();
    });

    it("renders the hero globe fallback when no image is provided", () => {
      const { container } = render(<CivilizationCard name="Rome" />);

      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("era", () => {
    it("formats BCE/CE start and end", () => {
      render(
        <CivilizationCard era={{ end: 476, start: -27 }} name="Roman Empire" />,
      );

      expect(screen.getByText("27 BCE – 476 CE")).toBeInTheDocument();
    });

    it('uses "present" when end is omitted', () => {
      render(<CivilizationCard era={{ start: 1776 }} name="USA" />);

      expect(screen.getByText("1776 CE – present")).toBeInTheDocument();
    });

    it("renders the era timeline bar", () => {
      render(
        <CivilizationCard era={{ end: 476, start: -27 }} name="Roman Empire" />,
      );

      expect(
        screen.getByRole("img", { name: /Era timeline/ }),
      ).toBeInTheDocument();
    });
  });

  describe("stats", () => {
    it("renders capital and peak population", () => {
      render(
        <CivilizationCard
          capital="Rome"
          name="Roman Empire"
          peakPopulation="70 million"
        />,
      );

      expect(screen.getByText("Capital")).toBeInTheDocument();
      expect(screen.getByText("Rome")).toBeInTheDocument();
      expect(screen.getByText("Peak population")).toBeInTheDocument();
      expect(screen.getByText("70 million")).toBeInTheDocument();
    });

    it("computes a duration when both era endpoints exist", () => {
      render(
        <CivilizationCard era={{ end: 476, start: -27 }} name="Roman Empire" />,
      );

      expect(screen.getByText("Duration")).toBeInTheDocument();
      expect(screen.getByText("503 years")).toBeInTheDocument();
    });
  });

  describe("lists", () => {
    it("renders achievements as badges", () => {
      render(
        <CivilizationCard
          achievements={["Aqueducts", "Law"]}
          name="Roman Empire"
        />,
      );

      expect(screen.getByText("Aqueducts")).toBeInTheDocument();
      expect(screen.getByText("Law")).toBeInTheDocument();
    });

    it("renders leaders as a list", () => {
      render(
        <CivilizationCard
          leaders={["Augustus", "Trajan"]}
          name="Roman Empire"
        />,
      );

      expect(screen.getByText("Augustus")).toBeInTheDocument();
      expect(screen.getByText("Trajan")).toBeInTheDocument();
    });
  });

  describe("action", () => {
    it("renders actionHref as a link", () => {
      render(<CivilizationCard actionHref="/civ/rome" name="Roman Empire" />);

      expect(screen.getByRole("link", { name: /Explore/ })).toHaveAttribute(
        "href",
        "/civ/rome",
      );
    });
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
