import { NextResponse } from "next/server";

import { nativeRegistry } from "@/lib/native-registry";

export const dynamic = "force-static";

export function GET(): NextResponse {
  return NextResponse.json(nativeRegistry);
}
