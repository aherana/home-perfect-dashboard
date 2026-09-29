import { NextResponse } from "next/server";
import { isApiEnabled, setApiEnabled } from "@/lib/api-toggle";
import type { ApiToggleState } from "@/lib/types";

function state(): ApiToggleState {
  return { enabled: isApiEnabled() };
}

export async function GET() {
  return NextResponse.json(state(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  setApiEnabled(!isApiEnabled());
  return NextResponse.json(state(), { headers: { "Cache-Control": "no-store" } });
}
