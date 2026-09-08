import { NextResponse } from "next/server";

import { registry } from "@/lib/registry";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/require-await
export async function GET() {
  return NextResponse.json(registry);
}
