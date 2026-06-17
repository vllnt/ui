import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Blockquote,
  H1,
  H2,
  H3,
  H4,
  InlineCode,
  Lead,
  List,
  Muted,
  P,
} from "./typography";

const meta = {
  component: H1,
  title: "Core/Typography",
} satisfies Meta<typeof H1>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Headings: Story = {
  render: () => (
    <div>
      <H1>The quick brown fox</H1>
      <H2>The quick brown fox</H2>
      <H3>The quick brown fox</H3>
      <H4>The quick brown fox</H4>
    </div>
  ),
};

export const Body: Story = {
  render: () => (
    <div>
      <Lead>A short, emphasised lead paragraph that introduces the topic.</Lead>
      <P>
        A standard body paragraph with comfortable line height and spacing.
        Inline code such as <InlineCode>npm install</InlineCode> stays legible.
      </P>
      <Muted>Muted secondary text for captions and hints.</Muted>
    </div>
  ),
};

export const Quote: Story = {
  render: () => (
    <Blockquote>
      &ldquo;Design is not just what it looks like and feels like. Design is how
      it works.&rdquo;
    </Blockquote>
  ),
};

export const BulletedList: Story = {
  render: () => (
    <List>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </List>
  ),
};
