import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tasks = await db.task.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ tasks });
}
