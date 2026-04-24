import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../input";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

const meta = {
  component: Form,
  title: "Core/Form",
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Form>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@company.com" type="email" />
          </FormControl>
          <FormDescription>Use your work email address.</FormDescription>
          <FormMessage>We will never share your email.</FormMessage>
        </FormItem>
      </Form>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Form invalid required>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@company.com" type="email" />
          </FormControl>
          <FormDescription>This email will be used for account recovery.</FormDescription>
          <FormMessage>Please enter a valid email address.</FormMessage>
        </FormItem>
      </Form>
    </div>
  ),
};
