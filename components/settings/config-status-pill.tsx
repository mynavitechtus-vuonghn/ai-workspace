import { cn } from "@/lib/utils";

export function ConfigStatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        ok
          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400"
          : "bg-amber-500/15 text-amber-900 dark:text-amber-300",
      )}
    >
      {ok ? "Đã cấu hình" : "Chưa có"}
    </span>
  );
}
