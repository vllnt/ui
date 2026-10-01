import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileUpload } from "./file-upload";

const meta = {
  args: {
    helperText: "PNG, JPG, or PDF up to 10MB.",
  },
  component: FileUpload,
  title: "Form/FileUpload",
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
