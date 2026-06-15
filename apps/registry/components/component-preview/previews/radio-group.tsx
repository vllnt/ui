"use client";

import { RadioGroup, RadioGroupItem } from "@vllnt/ui";

export default function RadioGroupPreview() {
  return (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center gap-x-2">
        <RadioGroupItem id="option-one" value="option-one" />
        <label className="text-sm" htmlFor="option-one">
          Option One
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <RadioGroupItem id="option-two" value="option-two" />
        <label className="text-sm" htmlFor="option-two">
          Option Two
        </label>
      </div>
    </RadioGroup>
  );
}
