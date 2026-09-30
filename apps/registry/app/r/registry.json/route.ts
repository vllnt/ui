import { NextResponse } from "next/server";

import { registry } from "@/lib/registry";

export function GET(): NextResponse {
  return NextResponse.json(registry);
}
