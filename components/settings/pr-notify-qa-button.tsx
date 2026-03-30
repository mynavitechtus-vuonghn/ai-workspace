"use client";

import { useState } from "react";

import { notifyUnreviewedPrsToSlackQaNow } from "@/actions/pr-notify-qa";
import { Button } from "@/components/ui/button";

export function PrNotifyQaButton() {
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
            const r = await notifyUnreviewedPrsToSlackQaNow();
            if (!r.ok) {
              setLast(`Lỗi: ${r.error}`);
            } else if ("sent" in r && r.sent) {
              setLast(`Đã gửi Slack QA (${r.pullCount} PR).`);
            } else if ("skipped" in r && r.skipped) {
              setLast(r.reason);
            }
          } catch (e) {
            setLast(e instanceof Error ? e.message : "Lỗi không xác định");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Đang gửi…" : "Gửi thử → Slack QA"}
      </Button>
      {last ? <p className="text-xs text-muted-foreground">{last}</p> : null}
    </div>
  );
}
