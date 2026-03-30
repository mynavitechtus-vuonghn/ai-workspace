import type { Status } from "@prisma/client";

export const STATUS_COLUMNS: { id: Status; label: string }[] = [
  { id: "TODO", label: "To do" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "REVIEW", label: "Review" },
  { id: "DONE", label: "Done" },
];
