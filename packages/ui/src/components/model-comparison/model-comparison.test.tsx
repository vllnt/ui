import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ModelComparison,
  ModelComparisonColumn,
  ModelComparisonMeta,
  ModelComparisonVote,
} from "./model-comparison";

describe("ModelComparison", () => {
  describe("rendering", () => {
    it("renders the prompt when provided", () => {
      render(
        <ModelComparison prompt="Explain closures">
          <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
            {null}
          </ModelComparisonColumn>
        </ModelComparison>,
      );

      expect(screen.getByText("Prompt")).toBeInTheDocument();
      expect(screen.getByText("Explain closures")).toBeInTheDocument();
    });

    it("hides the header when prompt is omitted and toggle is suppressed", () => {
      render(
        <ModelComparison hideBlindToggle>
          <ModelComparisonColumn label="A" model="m" />
        </ModelComparison>,
      );

      expect(screen.queryByText("Prompt")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Hide|Reveal/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("blind mode", () => {
    it("toggles blind mode when the user clicks the control", () => {
      render(
        <ModelComparison>
          <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
            content
          </ModelComparisonColumn>
        </ModelComparison>,
      );

      expect(screen.getByText("Sonnet")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Hide models" }));

      expect(screen.queryByText("Sonnet")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reveal models" }),
      ).toBeInTheDocument();
    });

    it("respects blindDefault", () => {
      render(
        <ModelComparison blindDefault>
          <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
            content
          </ModelComparisonColumn>
        </ModelComparison>,
      );

      expect(screen.queryByText("Sonnet")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reveal models" }),
      ).toBeInTheDocument();
    });

    it("strips data-model when blind", () => {
      render(
        <ModelComparison blindDefault>
          <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
            content
          </ModelComparisonColumn>
        </ModelComparison>,
      );

      const articles = document.querySelectorAll("article");
      expect(articles.length).toBe(1);
      expect(articles[0]).toHaveAttribute("data-blind", "true");
      expect(articles[0]?.dataset.model).toBeUndefined();
    });

    it("assigns sequential, unique, colon-free blind labels", () => {
      render(
        <ModelComparison blindDefault>
          <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
            content
          </ModelComparisonColumn>
          <ModelComparisonColumn label="GPT" model="gpt-4o">
            content
          </ModelComparisonColumn>
        </ModelComparison>,
      );

      expect(
        screen.getByRole("heading", { name: "Model A" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Model B" }),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Model .*:/)).not.toBeInTheDocument();
    });
  });

  describe("ModelComparisonMeta", () => {
    it("renders only the stats provided", () => {
      render(
        <ModelComparison hideBlindToggle>
          <ModelComparisonColumn label="A" model="m">
            <ModelComparisonMeta cost="$0.003" tokens={320} />
          </ModelComparisonColumn>
        </ModelComparison>,
      );

      expect(screen.getByText("Tokens")).toBeInTheDocument();
      expect(screen.getByText("320")).toBeInTheDocument();
      expect(screen.getByText("Cost")).toBeInTheDocument();
      expect(screen.getByText("$0.003")).toBeInTheDocument();
      expect(screen.queryByText("Latency")).not.toBeInTheDocument();
    });

    it("returns null when nothing is provided", () => {
      const { container } = render(<ModelComparisonMeta />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("ModelComparisonVote", () => {
    it("emits the vote value", () => {
      const onVote = vi.fn();
      render(
        <ModelComparison hideBlindToggle>
          <ModelComparisonVote onVote={onVote} />
        </ModelComparison>,
      );

      fireEvent.click(screen.getByRole("button", { name: /Left/ }));
      fireEvent.click(screen.getByRole("button", { name: "Tie" }));
      fireEvent.click(screen.getByRole("button", { name: /Right/ }));

      expect(onVote).toHaveBeenNthCalledWith(1, "left");
      expect(onVote).toHaveBeenNthCalledWith(2, "tie");
      expect(onVote).toHaveBeenNthCalledWith(3, "right");
    });

    it("spans the full comparison grid width", () => {
      const { container } = render(
        <ModelComparison hideBlindToggle>
          <ModelComparisonVote />
        </ModelComparison>,
      );

      const vote = container.querySelector(".col-span-full");
      expect(vote).not.toBeNull();
    });
  });
});
