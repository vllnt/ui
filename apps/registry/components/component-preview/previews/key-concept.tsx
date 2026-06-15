"use client";

import { Glossary, KeyConcept } from "@vllnt/ui";

export default function KeyConceptPreview() {
  return (
    <div className="space-y-4">
      <KeyConcept highlight term="Component">
        <p>A reusable piece of UI that encapsulates structure and behavior.</p>
      </KeyConcept>
      <Glossary title="Key Terms">
        <KeyConcept term="Props">
          <p>Data passed from parent to child components.</p>
        </KeyConcept>
        <KeyConcept term="State">
          <p>Data that changes over time within a component.</p>
        </KeyConcept>
      </Glossary>
    </div>
  );
}
