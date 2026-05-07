import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type PromptTemplate, PromptTemplates } from "./prompt-templates";

const TEMPLATES: PromptTemplate[] = [
  {
    category: "Code",
    description: "Review code for bugs",
    id: "code-review",
    template: "Review this {{language}} code:\n\n{{code}}",
    title: "Code Review",
  },
  {
    category: "Writing",
    description: "Polish a draft",
    id: "writing-polish",
    template: "Polish the following text:\n\n{{text}}",
    title: "Polish writing",
  },
  {
    category: "Code",
    description: "Walk through what each line does",
    id: "code-explain",
    template: "Explain what this code does line by line.",
    title: "Explain code",
  },
];

function clickUseFor(title: string): void {
  const card = screen.getByText(title).closest("article");
  const useButton = card?.querySelector("button");
  if (!useButton) throw new Error(`expected ${title} card to render`);
  fireEvent.click(useButton);
}

describe("PromptTemplates", () => {
  describe("rendering", () => {
    it("renders all templates by default", () => {
      render(<PromptTemplates templates={TEMPLATES} />);

      expect(screen.getByText("Code Review")).toBeInTheDocument();
      expect(screen.getByText("Polish writing")).toBeInTheDocument();
      expect(screen.getByText("Explain code")).toBeInTheDocument();
    });

    it("renders the empty state when no template matches", () => {
      render(
        <PromptTemplates labels={{ empty: "Nothing here." }} templates={[]} />,
      );

      expect(screen.getByText("Nothing here.")).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("filters by search query against title and description", () => {
      render(<PromptTemplates templates={TEMPLATES} />);

      fireEvent.change(screen.getByPlaceholderText("Search prompts…"), {
        target: { value: "polish" },
      });

      expect(screen.getByText("Polish writing")).toBeInTheDocument();
      expect(screen.queryByText("Code Review")).not.toBeInTheDocument();
    });

    it("filters by category chip", () => {
      render(
        <PromptTemplates
          categories={[{ name: "Code" }, { name: "Writing" }]}
          templates={TEMPLATES}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "Writing" }));

      expect(screen.getByText("Polish writing")).toBeInTheDocument();
      expect(screen.queryByText("Code Review")).not.toBeInTheDocument();
    });

    it("returns all templates when the All chip is selected again", () => {
      render(
        <PromptTemplates
          categories={[{ name: "Code" }]}
          templates={TEMPLATES}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "Code" }));
      expect(screen.queryByText("Polish writing")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("tab", { name: "All" }));
      expect(screen.getByText("Polish writing")).toBeInTheDocument();
    });
  });

  describe("variables", () => {
    it("invokes onSelect immediately for templates without variables", () => {
      const onSelect = vi.fn();
      render(<PromptTemplates onSelect={onSelect} templates={TEMPLATES} />);

      const card = screen.getByText("Explain code").closest("article");
      const useButton = card?.querySelector("button");
      if (!useButton) throw new Error("expected the use button to render");
      fireEvent.click(useButton);

      expect(onSelect).toHaveBeenCalledWith(
        "Explain what this code does line by line.",
        TEMPLATES[2],
      );
    });

    it("opens an inline form when the user activates a template with variables", () => {
      render(<PromptTemplates templates={TEMPLATES} />);

      clickUseFor("Code Review");

      expect(screen.getByText("Fill in the placeholders")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Value for language"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Value for code")).toBeInTheDocument();
    });

    it("resolves the template with the user's values on Insert", () => {
      const onSelect = vi.fn();
      render(<PromptTemplates onSelect={onSelect} templates={TEMPLATES} />);

      clickUseFor("Code Review");
      fireEvent.change(screen.getByPlaceholderText("Value for language"), {
        target: { value: "TypeScript" },
      });
      fireEvent.change(screen.getByPlaceholderText("Value for code"), {
        target: { value: "const x = 1" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Insert" }));

      expect(onSelect).toHaveBeenCalledWith(
        "Review this TypeScript code:\n\nconst x = 1",
        TEMPLATES[0],
      );
    });

    it("leaves placeholders intact when the user submits without filling them", () => {
      const onSelect = vi.fn();
      render(<PromptTemplates onSelect={onSelect} templates={TEMPLATES} />);

      clickUseFor("Code Review");
      fireEvent.click(screen.getByRole("button", { name: "Insert" }));

      expect(onSelect).toHaveBeenCalledWith(
        "Review this {{language}} code:\n\n{{code}}",
        TEMPLATES[0],
      );
    });

    it("clears the form on Cancel", () => {
      render(<PromptTemplates templates={TEMPLATES} />);

      clickUseFor("Code Review");
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(
        screen.queryByText("Fill in the placeholders"),
      ).not.toBeInTheDocument();
    });
  });
});
