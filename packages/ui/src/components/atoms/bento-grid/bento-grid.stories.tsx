import type { Meta, StoryObj } from "@storybook/react-vite";

import { BentoCard, BentoGrid } from "./bento-grid";

const meta = {
  component: BentoGrid,
  title: "Effects/BentoGrid",
} satisfies Meta<typeof BentoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BentoGrid>
      <BentoCard className="col-span-2">Featured</BentoCard>
      <BentoCard>Detail</BentoCard>
      <BentoCard>Detail</BentoCard>
      <BentoCard className="col-span-2">Wide</BentoCard>
    </BentoGrid>
  ),
};
