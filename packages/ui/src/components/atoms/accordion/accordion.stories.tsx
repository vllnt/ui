// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta = {
  args: {
    children: (
      <>
        <AccordionItem value="item-1">
          <AccordionTrigger value="item-1">
            What is this component?
          </AccordionTrigger>
          <AccordionContent value="item-1">
            A vertically stacked set of interactive headings that reveal
            content.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger value="item-2">Is it accessible?</AccordionTrigger>
          <AccordionContent value="item-2">
            Yes. Each trigger is a button that reports its expanded state.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger value="item-3">Can several stay open?</AccordionTrigger>
          <AccordionContent value="item-3">
            Set type to &quot;multiple&quot; to keep several items open.
          </AccordionContent>
        </AccordionItem>
      </>
    ),
    className: "w-full max-w-md",
    defaultValue: "item-1",
    type: "single",
  },
  component: Accordion,
  title: "Content/Accordion",
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
