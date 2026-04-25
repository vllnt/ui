import * as React from "react";

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

const visualSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type VisualValues = z.infer<typeof visualSchema>;

export function FormInvalidEmailPreview() {
  return (
    <Form<VisualValues>
      className="w-80 rounded-lg border border-border bg-card p-6"
      defaultValues={{ email: "" }}
      onSubmit={async () => {
        await Promise.resolve();
      }}
      schema={visualSchema}
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
                  <Input
                    placeholder="name@company.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Use your work email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </>
      )}
    </Form>
  );
}
