import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EraColumn,
  EraComparison,
  EraDomain,
  EraFigure,
  EraHighlight,
} from "./era-comparison";

describe("EraComparison", () => {
  describe("rendering", () => {
    it("renders all era columns and their headers", () => {
      render(
        <EraComparison>
          <EraColumn color="amber" name="Renaissance" period="1400–1600">
            <EraDomain name="Art">
              <EraHighlight>Perspective painting</EraHighlight>
              <EraFigure name="Leonardo da Vinci" />
            </EraDomain>
          </EraColumn>
          <EraColumn
            color="emerald"
            name="Islamic Golden Age"
            period="800–1400"
          >
            <EraDomain name="Science">
              <EraHighlight>Algebra, optics</EraHighlight>
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      expect(
        screen.getByRole("heading", { level: 3, name: "Renaissance" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "Islamic Golden Age" }),
      ).toBeInTheDocument();
      expect(screen.getByText("1400–1600")).toBeInTheDocument();
      expect(screen.getByText("800–1400")).toBeInTheDocument();
    });

    it("emits data-color and data-domain attributes", () => {
      const { container } = render(
        <EraComparison>
          <EraColumn color="purple" name="Era">
            <EraDomain name="Art">
              <EraHighlight>x</EraHighlight>
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      expect(container.querySelector("article")).toHaveAttribute(
        "data-color",
        "purple",
      );
      expect(container.querySelector("section[data-domain]")).toHaveAttribute(
        "data-domain",
        "Art",
      );
    });

    it("renders region when provided", () => {
      render(
        <EraComparison>
          <EraColumn name="Era" region="Mediterranean">
            <EraDomain name="Art">
              <EraHighlight>x</EraHighlight>
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      expect(screen.getByText("Mediterranean")).toBeInTheDocument();
    });

    it("omits the period chip when no period is provided", () => {
      render(
        <EraComparison>
          <EraColumn name="Era">
            <EraDomain name="Art">
              <EraHighlight>x</EraHighlight>
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      expect(screen.queryByText(/^\d{3,4}/)).not.toBeInTheDocument();
    });
  });

  describe("EraDomain", () => {
    it("renders the domain heading and highlights", () => {
      render(
        <EraComparison>
          <EraColumn name="Era">
            <EraDomain name="Art">
              <EraHighlight>Perspective painting</EraHighlight>
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      expect(
        screen.getByRole("heading", { level: 4, name: "Art" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Perspective painting")).toBeInTheDocument();
    });
  });

  describe("EraFigure", () => {
    it("renders as a span by default", () => {
      render(
        <EraComparison>
          <EraColumn name="Era">
            <EraDomain name="Art">
              <EraFigure name="Leonardo" />
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      const node = screen.getByText("Leonardo");
      expect(node.tagName).toBe("SPAN");
    });

    it("renders as a link when href is set", () => {
      render(
        <EraComparison>
          <EraColumn name="Era">
            <EraDomain name="Art">
              <EraFigure href="/figures/leonardo" name="Leonardo" />
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      const link = screen.getByRole("link", { name: "Leonardo" });
      expect(link).toHaveAttribute("href", "/figures/leonardo");
    });

    it("forwards anchorProps to the rendered <a>", () => {
      render(
        <EraComparison>
          <EraColumn name="Era">
            <EraDomain name="Art">
              <EraFigure
                anchorProps={{ rel: "noopener", target: "_blank" }}
                href="/figures/leonardo"
                name="Leonardo"
              />
            </EraDomain>
          </EraColumn>
        </EraComparison>,
      );

      const link = screen.getByRole("link", { name: "Leonardo" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener");
    });
  });
});
