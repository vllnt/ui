import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";

import { type ModelInfo, ModelSelector } from "./model-selector";

const models: ModelInfo[] = [
  {
    description: "Fast multimodal model",
    id: "openai/gpt-4o",
    name: "GPT-4o",
    pricing: { input: 2.5, output: 10 },
  },
  {
    description: "Long context reasoning model",
    id: "anthropic/claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    pricing: { input: 3, output: 15 },
  },
  {
    description: "Gemini family model",
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
  },
];

function getModelItem(name: string): Element {
  const item = screen.getByText(name).closest("[cmdk-item]");
  if (!item) throw new Error(`Expected ${name} to render as a model item`);
  return item;
}

function renderModelSelector(
  overrides: Partial<React.ComponentProps<typeof ModelSelector>> = {},
) {
  const props = {
    models,
    onOpenChange: vi.fn(),
    onSelectModel: vi.fn(),
    open: true,
    selectedModelId: "google/gemini-1.5-pro",
    ...overrides,
  };

  render(<ModelSelector {...props} />);

  return props;
}

describe("ModelSelector", () => {
  it("renders the open dialog with selected model promoted and disabled", () => {
    renderModelSelector();

    expect(screen.getByText("Select Model")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(getModelItem("Gemini 1.5 Pro")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByText("In: $2.50/1M")).toBeInTheDocument();
    expect(screen.getByText("Out: $10.00/1M")).toBeInTheDocument();
  });

  it("filters models by search text across provider metadata", () => {
    renderModelSelector();

    fireEvent.change(
      screen.getByPlaceholderText("Search models or providers..."),
      {
        target: { value: "anthropic" },
      },
    );

    expect(screen.getByText("Claude 3.5 Sonnet")).toBeInTheDocument();
    expect(screen.queryByText("GPT-4o")).not.toBeInTheDocument();
    expect(screen.queryByText("Gemini 1.5 Pro")).not.toBeInTheDocument();
  });

  it("selects a non-current model and closes the dialog", () => {
    const onOpenChange = vi.fn();
    const onSelectModel = vi.fn();
    renderModelSelector({ onOpenChange, onSelectModel });

    fireEvent.click(getModelItem("Claude 3.5 Sonnet"));

    expect(onSelectModel).toHaveBeenCalledWith("anthropic/claude-3-5-sonnet");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
