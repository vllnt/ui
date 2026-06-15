"use client";

import { Quiz } from "@vllnt/ui";

export default function QuizPreview() {
  return (
    <Quiz
      explanation={
        <p>Paris has been France&apos;s capital since the 12th century.</p>
      }
      hint="It's known as the City of Light"
      options={[
        { label: "London" },
        { correct: true, label: "Paris" },
        { label: "Berlin" },
      ]}
      question="What is the capital of France?"
    />
  );
}
