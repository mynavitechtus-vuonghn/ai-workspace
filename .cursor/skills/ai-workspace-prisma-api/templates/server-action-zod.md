# Template — Server Action with Zod

```ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  title: z.string().min(1),
  userId: z.string().min(1),
});

export async function createExampleAction(raw: unknown) {
  const data = inputSchema.parse(raw);
  const row = await db.task.create({
    data: {
      title: data.title,
      userId: data.userId,
    },
  });
  revalidatePath("/tasks");
  return row;
}
```

Adjust model and path. Add auth check when NextAuth is available.
