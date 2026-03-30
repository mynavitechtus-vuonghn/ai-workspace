import { ChatPanel } from "@/components/ai/chat-panel";

export default function AIChatPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Streaming chat via Vercel AI SDK (<code className="text-xs">/api/chat</code>). The model can
          create tasks using tools when you ask.
        </p>
      </div>
      <ChatPanel />
    </section>
  );
}
