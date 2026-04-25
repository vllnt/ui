import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { z } from "zod";

import { Button } from "../button";
import { Input } from "../input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

const profileSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  name: z.string().min(2, "Enter at least 2 characters."),
});

type ProfileValues = z.infer<typeof profileSchema>;

type ProfileFormExampleProps = {
  serverError?: boolean;
};

function ProfileFormExample({
  serverError = false,
}: ProfileFormExampleProps) {
  const [submitted, setSubmitted] = React.useState<ProfileValues | null>(null);

  return (
    <Form<ProfileValues>
      className="w-full max-w-md rounded-lg border border-border bg-card p-6"
      defaultValues={{ email: "", name: "" }}
      onValidSubmit={async (values, form) => {
        setSubmitted(null);
        await Promise.resolve();

        if (serverError) {
          form.setError("email", {
            message: "This email is already in use.",
            type: "server",
          });
          return;
        }

        setSubmitted(values);
      }}
      schema={profileSchema}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  Use your work email address for notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Ada Lovelace" {...field} />
                </FormControl>
                <FormDescription>
                  We will use this name in collaborator mentions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3">
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? "Saving…" : "Submit"}
            </Button>
            {submitted ? (
              <p className="text-sm text-muted-foreground">
                Submitted for {submitted.name}.
              </p>
            ) : null}
          </div>
        </>
      )}
    </Form>
  );
}

const meta = {
  component: ProfileFormExample,
  title: "Core/Form",
} satisfies Meta<typeof ProfileFormExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ServerError: Story = {
  args: {
    serverError: true,
  },
};
