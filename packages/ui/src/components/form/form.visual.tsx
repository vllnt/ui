import { expect, test } from "@playwright/experimental-ct-react";

import { Input } from "../input";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

test.describe("Form Visual", () => {
  test("invalid state", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
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
      </div>,
    );

    await expect(page).toHaveScreenshot("form-invalid.png");
  });
});
