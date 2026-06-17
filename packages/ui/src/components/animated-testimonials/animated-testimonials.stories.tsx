import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedTestimonials } from "./animated-testimonials";

const meta = {
  args: {
    testimonials: [
      { name: "Ada Lovelace", quote: "This shipped our launch in a day.", title: "Engineer" },
      { name: "Grace Hopper", quote: "The motion feels effortless.", title: "Admiral" },
    ],
  },
  component: AnimatedTestimonials,
  title: "Effects/AnimatedTestimonials",
} satisfies Meta<typeof AnimatedTestimonials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Autoplay: Story = {
  args: {
    autoplay: true,
  },
};
