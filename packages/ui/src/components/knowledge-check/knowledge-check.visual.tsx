import { expect, test } from "@playwright/experimental-ct-react";

import {
  KnowledgeCheck,
  type KnowledgeCheckQuestion,
} from "./knowledge-check";

const QUESTIONS: KnowledgeCheckQuestion[] = [
  {
    id: "react-purpose",
    options: [
      { correct: true, label: "A UI library", value: "ui" },
      { label: "A database", value: "db" },
      { label: "A backend framework", value: "backend" },
    ],
    question: "What is React?",
    type: "multiple-choice",
  },
];

test.describe("KnowledgeCheck Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <KnowledgeCheck questions={QUESTIONS} title="Check your understanding" />,
    );
    await expect(component).toHaveScreenshot("knowledge-check-default.png");
  });
});
