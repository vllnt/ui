import { NextResponse } from "next/server";

import { nativeRegistry } from "@/lib/native-registry";

export const dynamic = "force-static";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function GET(): NextResponse {
  return NextResponse.json(nativeRegistry);
}
