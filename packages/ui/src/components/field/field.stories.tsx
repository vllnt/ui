import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../input/input";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "./field";

const meta = {
  component: Field,
  title: "Form/Field",
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field className="w-72">
      <FieldLabel>Email</FieldLabel>
      <FieldControl>
        <Input placeholder="you@example.com" type="email" />
      </FieldControl>
      <FieldDescription>We will never share your email.</FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field className="w-72" invalid>
      <FieldLabel>Password</FieldLabel>
      <FieldControl>
        <Input type="password" />
      </FieldControl>
      <FieldError>Must be at least 8 characters.</FieldError>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field className="w-96" orientation="horizontal">
      <FieldLabel>Subscribe</FieldLabel>
      <FieldControl>
        <Input placeholder="name@example.com" />
      </FieldControl>
    </Field>
  ),
};
