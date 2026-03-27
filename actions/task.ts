"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUS_VALUES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

const createTaskInput = z.object({
  title: z.string().min(1),
  userId: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(PRIORITY_VALUES).default("MEDIUM"),
  dueDate: z.string().optional(),
});

const updateTaskStatusInput = z.object({
  id: z.string().min(1),
  status: z.enum(STATUS_VALUES),
});

export async function createTaskAction(input: z.infer<typeof createTaskInput>) {
  const data = createTaskInput.parse(input);
  return db.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      userId: data.userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
}

export async function updateTaskStatusAction(input: z.infer<typeof updateTaskStatusInput>) {
  const data = updateTaskStatusInput.parse(input);
  return db.task.update({
    where: { id: data.id },
    data: { status: data.status },
  });
}

export async function deleteTaskAction(id: string) {
  if (!id) throw new Error("Task id is required");

  return db.task.delete({
    where: { id },
  });
}
