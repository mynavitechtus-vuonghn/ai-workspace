import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const workflows = await db.workflow.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ workflows });
}
