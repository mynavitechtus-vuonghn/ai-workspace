"use server";

import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
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

export async function createTaskFormAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Title required");
  }
  await createTaskAction({
    title,
    userId: session.user.id,
    priority: "MEDIUM",
  });
}

export async function createTaskAction(input: z.infer<typeof createTaskInput>) {
  const data = createTaskInput.parse(input);
  const task = await db.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      userId: data.userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
  revalidatePath("/tasks");
  revalidatePath("/");
  return task;
}

export async function updateTaskStatusAction(input: z.infer<typeof updateTaskStatusInput>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const data = updateTaskStatusInput.parse(input);
  const existing = await db.task.findFirst({
    where: { id: data.id, userId: session.user.id },
  });
  if (!existing) {
    throw new Error("Task not found");
  }
  const task = await db.task.update({
    where: { id: data.id },
    data: { status: data.status },
  });
  revalidatePath("/tasks");
  revalidatePath("/");
  return task;
}

export async function deleteTaskAction(id: string) {
  if (!id) throw new Error("Task id is required");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  await db.task.deleteMany({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/tasks");
  revalidatePath("/");
}
