# Template — GET JSON list (`app/api/.../route.ts`)

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.task.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

Add `request: Request` + query params when needed. Add session guard before returning sensitive rows.
