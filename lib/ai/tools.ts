import { db } from "@/lib/db";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export async function createTaskTool(input: {
  title: string;
  userId: string;
  priority?: Priority;
  dueDate?: string;
}) {
  return db.task.create({
    data: {
      title: input.title,
      userId: input.userId,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
  });
}

export async function listTasksTool(input: { userId: string; limit?: number }) {
  return db.task.findMany({
    where: { userId: input.userId },
    orderBy: { updatedAt: "desc" },
    take: input.limit ?? 10,
  });
}
