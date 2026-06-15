"use client";

import * as React from "react";

import { Calendar } from "@vllnt/ui";

export default function CalendarPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return <Calendar mode="single" onSelect={setDate} selected={date} />;
}
