import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HistoricalFigureCard } from "./historical-figure-card";

const NAME = "Leonardo da Vinci";

describe("HistoricalFigureCard", () => {
  it("renders the minimal card: heading, fallback initials, no lifespan bar", () => {
    render(<HistoricalFigureCard birth={{ year: 1452 }} name={NAME} />);
    expect(
      screen.getByRole("heading", { level: 3, name: NAME }),
    ).toBeInTheDocument();
    expect(screen.getByText("LD")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /Lifespan/ }),
    ).not.toBeInTheDocument();
  });

  it("renders title, era, life events, lifespan, lists, quote, and profile link", () => {
    render(
      <HistoricalFigureCard
        birth={{ place: "Vinci, Italy", year: 1452 }}
        connections={[
          { name: "Lorenzo de Medici", relation: "Patron" },
          {
            href: "/figures/michelangelo",
            name: "Michelangelo",
            relation: "Rival",
          },
        ]}
        death={{ place: "Amboise, France", year: 1519 }}
        era="Renaissance"
        fields={["Art", "Science"]}
        name={NAME}
        profileHref="/figures/da-vinci"
        quote={{
          source: "Notebooks",
          text: "Learning never exhausts the mind.",
        }}
        title="Polymath"
        works={["Mona Lisa"]}
      />,
    );
    expect(screen.getByText("Polymath")).toBeInTheDocument();
    expect(screen.getByText("Renaissance")).toBeInTheDocument();
    expect(screen.getByText("Born")).toBeInTheDocument();
    expect(screen.getByText("Died")).toBeInTheDocument();
    expect(screen.getByText("Art")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText("Mona Lisa")).toBeInTheDocument();
    expect(screen.getByText("Lorenzo de Medici")).toBeInTheDocument();
    expect(screen.getByText("Patron")).toBeInTheDocument();
    expect(screen.getByText(/1452/)).toBeInTheDocument();
    expect(screen.getByText(/Vinci, Italy/)).toBeInTheDocument();
    expect(screen.getByText(/1519/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Lifespan/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Michelangelo" })).toHaveAttribute(
      "href",
      "/figures/michelangelo",
    );
    expect(screen.getByRole("blockquote")).toBeInTheDocument();
    expect(
      screen.getByText(/Learning never exhausts the mind./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Notebooks/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /full profile/ })).toHaveAttribute(
      "href",
      "/figures/da-vinci",
    );
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
