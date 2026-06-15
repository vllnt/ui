"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@vllnt/ui";

export default function AccordionPreview() {
  return (
    <Accordion
      className="w-full max-w-[200px]"
      defaultValue="item-1"
      type="single"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger value="item-1">What is this?</AccordionTrigger>
        <AccordionContent value="item-1">
          A collapsible section.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
