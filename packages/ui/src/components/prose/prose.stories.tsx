import type { Meta, StoryObj } from "@storybook/react-vite";

import { Prose } from "./prose";

const meta = {
  component: Prose,
  title: "Core/Prose",
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Article: Story = {
  render: () => (
    <Prose>
      <h1>Article title</h1>
      <p>
        An introductory paragraph that sets up the long-form content with the
        token-driven type scale.
      </p>
      <h2>A section</h2>
      <p>More body copy with a bulleted list:</p>
      <ul>
        <li>First point</li>
        <li>Second point</li>
      </ul>
      <blockquote>A pulled quote for emphasis.</blockquote>
    </Prose>
  ),
};
