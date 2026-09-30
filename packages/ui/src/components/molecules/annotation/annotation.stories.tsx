import type { Meta, StoryObj } from "@storybook/react-vite";

import { Annotation, Highlight } from "./annotation";

const meta = {
  component: Annotation,
  title: "Learning/Annotation",
} satisfies Meta<typeof Annotation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <p className="max-w-2xl text-sm leading-7 text-foreground">
      In guided reading, <Annotation annotation="Scaffolding provides temporary support while a learner builds confidence.">scaffolding</Annotation> helps learners focus on the next meaningful step.
    </p>
  ),
};

export const HighlightOnly: Story = {
  render: () => (
    <p className="max-w-2xl text-sm leading-7 text-foreground">
      <Highlight tone="sky">Highlighted phrases</Highlight> can also stand on their own when you do not need an attached note.
    </p>
  ),
};
