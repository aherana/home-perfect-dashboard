import { NextResponse } from "next/server";
import { adjusterCasesData } from "@/lib/mock-data";
import { isApiEnabled } from "@/lib/api-toggle";

export async function GET() {
  if (!isApiEnabled()) {
    return NextResponse.json({ error: "API is currently disabled" }, { status: 503 });
  }
  return NextResponse.json(adjusterCasesData);
}
