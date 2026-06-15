"use client";

import { DatePicker } from "@vllnt/ui";

const DATE_PICKER_PREVIEW_DATE = new Date("2026-04-19T00:00:00.000Z");

export default function DatePickerPreview() {
  return (
    <div className="w-full max-w-sm">
      <DatePicker value={DATE_PICKER_PREVIEW_DATE} />
    </div>
  );
}
