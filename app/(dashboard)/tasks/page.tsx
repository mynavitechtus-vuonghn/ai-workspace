import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { CreateTaskForm } from "@/components/kanban/create-task-form";
import { TaskBoard } from "@/components/kanban/task-board";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tasks = await db.task.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag cards between columns to update status. Add tasks below.
        </p>
      </div>
      <CreateTaskForm />
      <TaskBoard tasks={tasks} />
    </section>
  );
}
