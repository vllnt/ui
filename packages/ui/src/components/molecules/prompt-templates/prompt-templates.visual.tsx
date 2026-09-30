import { expect, test } from "@playwright/experimental-ct-react";

import {
  type PromptTemplate,
  PromptTemplates,
} from "./prompt-templates";

const TEMPLATES: PromptTemplate[] = [
  {
    category: "Code",
    description: "Review code for bugs and improvements",
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
    category: "Analysis",
    description: "Summarize a document",
    id: "summary",
    template: "Summarize the following document in {{count}} bullet points.",
    title: "Summarize",
  },
];

test.describe("PromptTemplates Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <PromptTemplates
        categories={[
          { name: "Code" },
          { name: "Writing" },
          { name: "Analysis" },
        ]}
        templates={TEMPLATES}
      />,
    );
    await expect(component).toHaveScreenshot("prompt-templates-default.png");
  });

  test("empty", async ({ mount }) => {
    const component = await mount(<PromptTemplates templates={[]} />);
    await expect(component).toHaveScreenshot("prompt-templates-empty.png");
  });
});
