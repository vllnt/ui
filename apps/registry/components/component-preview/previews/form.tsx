"use client";

import { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage, Input } from "@vllnt/ui";

export default function FormPreview() {
  return (
    <div className="w-full max-w-sm">
      <Form invalid>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@company.com" type="email" />
          </FormControl>
          <FormDescription>Use your work email address.</FormDescription>
          <FormMessage>Please enter a valid email.</FormMessage>
        </FormItem>
      </Form>
    </div>
  );
}
