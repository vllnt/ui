import { NextResponse } from "next/server";

import registryData from "@/registry.json";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/require-await
export async function GET() {
  return NextResponse.json(registryData);
}
