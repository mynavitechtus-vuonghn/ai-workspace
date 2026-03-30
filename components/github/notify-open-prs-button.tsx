"use client";

import { useState } from "react";

import { notifyOpenPrsToSlackNow } from "@/actions/github-notify-open-prs";
import { Button } from "@/components/ui/button";

export function NotifyOpenPrsToSlackButton() {
  const [pending, setPending] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setLast(null);
          try {
            const r = await notifyOpenPrsToSlackNow();
            if (!r.ok) {
              setLast(`Lỗi: ${r.error}`);
            } else if ("skipped" in r && r.skipped) {
              setLast(r.reason);
            } else if ("sent" in r && r.sent) {
              setLast(`Đã gửi Slack (${r.prCount} PR).`);
            } else {
              setLast("Hoàn tất.");
            }
          } catch (e) {
            setLast(e instanceof Error ? e.message : "Lỗi không xác định");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Đang gửi…" : "Force gửi Slack → PR chưa merge"}
      </Button>
      {last ? <p className="text-xs text-muted-foreground">{last}</p> : null}
    </div>
  );
}

