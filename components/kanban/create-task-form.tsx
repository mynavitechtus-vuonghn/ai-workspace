import { createTaskFormAction } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateTaskForm() {
  return (
    <form action={createTaskFormAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="task-title">New task</Label>
        <Input id="task-title" name="title" placeholder="What needs to be done?" required />
      </div>
      <Button type="submit">Add task</Button>
    </form>
  );
}
