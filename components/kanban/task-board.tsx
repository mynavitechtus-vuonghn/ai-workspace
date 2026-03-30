"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Task, Status } from "@prisma/client";
import { useTransition } from "react";

import { updateTaskStatusAction } from "@/actions/task";
import { STATUS_COLUMNS } from "@/lib/task-columns";
import { cn } from "@/lib/utils";

function Column({ id, label, children }: { id: Status; label: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] flex-1 flex-col rounded-xl border border-border bg-muted/30 p-3",
        isOver && "ring-2 ring-ring/50",
      )}
    >
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{label}</h2>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-lg border border-border bg-card p-3 text-sm shadow-sm active:cursor-grabbing",
        isDragging && "opacity-60",
      )}
    >
      <p className="font-medium leading-snug">{task.title}</p>
      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      ) : null}
      <p className="mt-2 text-[10px] uppercase text-muted-foreground">{task.priority}</p>
    </div>
  );
}

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const nextStatus = over.id as Status;
    const valid = STATUS_COLUMNS.some((c) => c.id === nextStatus);
    if (!valid) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === nextStatus) return;

    startTransition(() => {
      void updateTaskStatusAction({ id: taskId, status: nextStatus });
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-4 lg:flex-row">
        {STATUS_COLUMNS.map((col) => (
          <Column key={col.id} id={col.id} label={col.label}>
            {tasks
              .filter((t) => t.status === col.id)
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
          </Column>
        ))}
      </div>
      {isPending ? (
        <p className="mt-2 text-xs text-muted-foreground">Updating…</p>
      ) : null}
    </DndContext>
  );
}
