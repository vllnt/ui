"use client";

import { Input } from "@vllnt/ui";

export default function InputPreview() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
    </div>
  );
}
