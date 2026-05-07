import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HistoricalFigureCard } from "./historical-figure-card";

const NAME = "Leonardo da Vinci";

describe("HistoricalFigureCard", () => {
  describe("rendering", () => {
    it("renders the name as a heading", () => {
      render(<HistoricalFigureCard name={NAME} />);

      expect(
        screen.getByRole("heading", { level: 3, name: NAME }),
      ).toBeInTheDocument();
    });

    it("renders title and era when provided", () => {
      render(
        <HistoricalFigureCard era="Renaissance" name={NAME} title="Polymath" />,
      );

      expect(screen.getByText("Polymath")).toBeInTheDocument();
      expect(screen.getByText("Renaissance")).toBeInTheDocument();
    });

    it("renders fallback initials when no portrait is provided", () => {
      render(<HistoricalFigureCard name={NAME} />);

      expect(screen.getByText("LD")).toBeInTheDocument();
    });
  });

  describe("life events", () => {
    it("renders birth and death lines with formatted years", () => {
      render(
        <HistoricalFigureCard
          birth={{ place: "Vinci, Italy", year: 1452 }}
          death={{ place: "Amboise, France", year: 1519 }}
          name={NAME}
        />,
      );

      expect(screen.getByText("Born")).toBeInTheDocument();
      expect(screen.getByText(/1452/)).toBeInTheDocument();
      expect(screen.getByText(/Vinci, Italy/)).toBeInTheDocument();
      expect(screen.getByText("Died")).toBeInTheDocument();
      expect(screen.getByText(/1519/)).toBeInTheDocument();
    });

    it("formats BC years with the suffix", () => {
      render(
        <HistoricalFigureCard
          birth={{ year: -106 }}
          death={{ year: -43 }}
          name="Cicero"
        />,
      );

      expect(screen.getByText(/106 BC/)).toBeInTheDocument();
      expect(screen.getByText(/43 BC/)).toBeInTheDocument();
    });

    it("renders the lifespan bar when both years are present", () => {
      render(
        <HistoricalFigureCard
          birth={{ year: 1452 }}
          death={{ year: 1519 }}
          name={NAME}
        />,
      );

      expect(screen.getByRole("img", { name: /Lifespan/ })).toBeInTheDocument();
    });

    it("hides the lifespan bar when years are missing", () => {
      render(<HistoricalFigureCard birth={{ year: 1452 }} name={NAME} />);

      expect(
        screen.queryByRole("img", { name: /Lifespan/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("lists", () => {
    it("renders fields as chips", () => {
      render(<HistoricalFigureCard fields={["Art", "Science"]} name={NAME} />);

      expect(screen.getByText("Art")).toBeInTheDocument();
      expect(screen.getByText("Science")).toBeInTheDocument();
    });

    it("renders works", () => {
      render(<HistoricalFigureCard name={NAME} works={["Mona Lisa"]} />);

      expect(screen.getByText("Mona Lisa")).toBeInTheDocument();
    });

    it("renders connections with relation", () => {
      render(
        <HistoricalFigureCard
          connections={[{ name: "Lorenzo de Medici", relation: "Patron" }]}
          name={NAME}
        />,
      );

      expect(screen.getByText("Lorenzo de Medici")).toBeInTheDocument();
      expect(screen.getByText("Patron")).toBeInTheDocument();
    });

    it("renders connections as links when href is provided", () => {
      render(
        <HistoricalFigureCard
          connections={[
            {
              href: "/figures/michelangelo",
              name: "Michelangelo",
              relation: "Rival",
            },
          ]}
          name={NAME}
        />,
      );

      expect(
        screen.getByRole("link", { name: "Michelangelo" }),
      ).toHaveAttribute("href", "/figures/michelangelo");
    });
  });

  describe("quote", () => {
    it("renders quote and source", () => {
      render(
        <HistoricalFigureCard
          name={NAME}
          quote={{
            source: "Notebooks",
            text: "Learning never exhausts the mind.",
          }}
        />,
      );

      expect(screen.getByRole("blockquote")).toBeInTheDocument();
      expect(
        screen.getByText(/Learning never exhausts the mind./),
      ).toBeInTheDocument();
      expect(screen.getByText(/Notebooks/)).toBeInTheDocument();
    });
  });

  describe("biography", () => {
    it("renders the bio toggle and toggles content", () => {
      render(
        <HistoricalFigureCard biography="Long biography text" name={NAME} />,
      );

      const toggle = screen.getByRole("button", { name: "Read biography" });
      expect(screen.queryByText("Long biography text")).not.toBeInTheDocument();

      fireEvent.click(toggle);

      expect(screen.getByText("Long biography text")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Hide biography" }),
      ).toBeInTheDocument();
    });
  });

  describe("profile link", () => {
    it("renders profileHref as a link", () => {
      render(
        <HistoricalFigureCard name={NAME} profileHref="/figures/da-vinci" />,
      );

      expect(
        screen.getByRole("link", { name: /full profile/ }),
      ).toHaveAttribute("href", "/figures/da-vinci");
    });
  });
});
