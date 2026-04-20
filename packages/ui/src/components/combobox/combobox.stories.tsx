import type { Meta, StoryObj } from "@storybook/react-vite";

import { Combobox } from "./combobox";

const meta = {
  args: {
    options: [
      { label: "Next.js", value: "next.js" },
      { label: "React", value: "react" },
      { label: "SvelteKit", value: "sveltekit" },
      { label: "Vue", value: "vue" },
    ],
    placeholder: "Select framework",
  },
  component: Combobox,
  title: "Form/Combobox",
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: "react",
  },
};
