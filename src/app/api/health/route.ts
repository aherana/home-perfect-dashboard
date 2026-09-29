import { NextResponse } from "next/server";
import { isApiEnabled } from "@/lib/api-toggle";
import type { HealthStatus } from "@/lib/types";

export async function GET() {
  const enabled = isApiEnabled();
  const body: HealthStatus = {
    status: enabled ? "ok" : "down",
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  };
  return NextResponse.json(body, { status: enabled ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
