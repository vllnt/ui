"use client";

import { FAQ, FAQItem } from "@vllnt/ui";

export default function FAQPreview() {
  return (
    // eslint-disable-next-line react/jsx-pascal-case -- FAQ is an acronym
    <FAQ title="Common Questions">
      <FAQItem question="What is this component?">
        <p>A collapsible FAQ component for displaying questions and answers.</p>
      </FAQItem>
      <FAQItem question="How do I use it?">
        <p>Wrap FAQItem components inside the FAQ component.</p>
      </FAQItem>
    </FAQ>
  );
}
