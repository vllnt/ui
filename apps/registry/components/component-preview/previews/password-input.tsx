"use client";

import { PasswordInput } from "@vllnt/ui";

export default function PasswordInputPreview() {
  return (
    <div className="w-full max-w-sm">
      <PasswordInput placeholder="Enter password" value="super-secret" />
    </div>
  );
}
