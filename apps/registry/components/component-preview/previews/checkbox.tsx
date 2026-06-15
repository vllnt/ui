"use client";

import { Checkbox } from "@vllnt/ui";

export default function CheckboxPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-x-2">
        <Checkbox id="terms" />
        <label className="text-sm" htmlFor="terms">
          Accept terms
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <Checkbox defaultChecked id="marketing" />
        <label className="text-sm" htmlFor="marketing">
          Receive emails
        </label>
      </div>
    </div>
  );
}
