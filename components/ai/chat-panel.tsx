"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

export function ChatPanel() {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({ transport });

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="min-h-[360px] space-y-4 rounded-xl border border-border bg-card p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Try: list your open GitHub PRs, create tasks, or post a summary to Slack (configure tokens in Settings).
          </p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                : "max-w-[85%] rounded-lg bg-muted px-3 py-2"
            }
          >
            <p className="text-xs font-medium text-muted-foreground">{m.role}</p>
            <p className="whitespace-pre-wrap text-sm">{messageText(m.parts)}</p>
          </div>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const field = form.elements.namedItem("message") as HTMLInputElement;
          const text = field?.value?.trim();
          if (!text) return;
          void sendMessage({ text });
          form.reset();
        }}
      >
        <Input
          name="message"
          placeholder="Message…"
          autoComplete="off"
          disabled={status === "streaming" || status === "submitted"}
        />
        <Button type="submit" disabled={status === "streaming" || status === "submitted"}>
          Send
        </Button>
      </form>
    </div>
  );
}
